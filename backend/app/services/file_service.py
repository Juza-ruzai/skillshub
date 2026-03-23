"""文件服务 - 处理 Skill 文件上传、存储、解压和访问."""

import os
import shutil
import zipfile
from uuid import UUID

from app.core.config import get_settings


class FileService:
    """文件服务类."""

    # 允许的文件扩展名
    ALLOWED_EXTENSIONS = {
        ".zip",
        ".md",
        ".txt",
        ".json",
        ".yaml",
        ".yml",
        ".py",
        ".js",
        ".ts",
        ".sh",
    }

    # 禁止的文件扩展名（可执行文件）
    DENIED_EXTENSIONS = {
        ".exe",
        ".dll",
        ".so",
        ".bat",
        ".cmd",
        ".msi",
        ".app",
        ".dmg",
    }

    def __init__(self, upload_dir: str | None = None) -> None:
        """初始化文件服务.

        Args:
            upload_dir: 上传文件存储目录，默认从配置读取
        """
        settings = get_settings()
        self.upload_dir = upload_dir or settings.upload_dir
        # 确保上传目录存在
        os.makedirs(self.upload_dir, exist_ok=True)

    def _get_skill_dir(self, skill_id: UUID) -> str:
        """获取 Skill 文件目录路径."""
        return os.path.join(self.upload_dir, str(skill_id))

    def _sanitize_filename(self, filename: str) -> str:
        """清理文件名，防止路径遍历攻击.

        Args:
            filename: 原始文件名

        Returns:
            清理后的文件名
        """
        # 移除路径分隔符和特殊字符
        filename = os.path.basename(filename)
        # 移除以点开头的隐藏文件
        if filename.startswith("."):
            filename = filename[1:]
        return filename

    def save_upload_file(
        self,
        skill_id: UUID,
        content: bytes,
        filename: str,
    ) -> str:
        """保存上传的文件.

        Args:
            skill_id: Skill ID
            content: 文件内容
            filename: 原始文件名

        Returns:
            保存后的文件路径
        """
        skill_dir = self._get_skill_dir(skill_id)
        os.makedirs(skill_dir, exist_ok=True)

        safe_filename = self._sanitize_filename(filename)
        file_path = os.path.join(skill_dir, safe_filename)

        with open(file_path, "wb") as f:
            f.write(content)

        return file_path

    def validate_file_type(self, filename: str) -> bool:
        """验证文件类型是否允许.

        Args:
            filename: 文件名

        Returns:
            是否允许上传
        """
        ext = os.path.splitext(filename)[1].lower()

        # 检查是否在禁止列表
        if ext in self.DENIED_EXTENSIONS:
            return False

        # 检查是否在允许列表
        return ext in self.ALLOWED_EXTENSIONS

    def validate_file_size(self, size: int, max_size: int | None = None) -> bool:
        """验证文件大小是否在限制内.

        Args:
            size: 文件大小（字节）
            max_size: 最大允许大小，默认 50MB

        Returns:
            是否在限制内
        """
        settings = get_settings()
        max_size = max_size or settings.max_file_size
        return size <= max_size

    def extract_zip_file(
        self,
        skill_id: UUID,
        zip_path: str,
        max_depth: int = 3,
    ) -> str:
        """解压 ZIP 文件.

        Args:
            skill_id: Skill ID
            zip_path: ZIP 文件路径
            max_depth: 最大解压深度

        Returns:
            解压目录路径
        """
        skill_dir = self._get_skill_dir(skill_id)
        extract_dir = os.path.join(skill_dir, "extracted")
        os.makedirs(extract_dir, exist_ok=True)

        with zipfile.ZipFile(zip_path, "r") as zf:
            for member in zf.namelist():
                # 检查路径深度
                depth = member.count("/")
                if depth > max_depth:
                    continue

                # 防止路径遍历
                if ".." in member or member.startswith("/"):
                    continue

                # 解压文件
                zf.extract(member, extract_dir)

        return extract_dir

    def get_file_tree(self, skill_id: UUID) -> dict | None:
        """获取文件树结构.

        Args:
            skill_id: Skill ID

        Returns:
            文件树字典，如果不存在返回 None
        """
        skill_dir = self._get_skill_dir(skill_id)
        extract_dir = os.path.join(skill_dir, "extracted")

        if not os.path.exists(extract_dir):
            return None

        def build_tree(path: str) -> dict:
            """递归构建文件树."""
            name = os.path.basename(path)
            if not name:
                name = "extracted"

            if os.path.isfile(path):
                return {
                    "name": name,
                    "type": "file",
                    "size": os.path.getsize(path),
                }

            children = []
            try:
                for item in sorted(os.listdir(path)):
                    item_path = os.path.join(path, item)
                    children.append(build_tree(item_path))
            except OSError:
                pass

            return {
                "name": name,
                "type": "directory",
                "children": children,
            }

        return build_tree(extract_dir)

    def read_skill_md(self, skill_id: UUID) -> str | None:
        """读取 SKILL.md 文件内容.

        Args:
            skill_id: Skill ID

        Returns:
            文件内容，如果不存在返回 None
        """
        skill_dir = self._get_skill_dir(skill_id)
        extract_dir = os.path.join(skill_dir, "extracted")

        # 尝试多个可能的文件名（大小写不敏感）
        possible_names = ["SKILL.md", "skill.md", "Skill.md", "README.md", "readme.md"]

        for name in possible_names:
            file_path = os.path.join(extract_dir, name)
            if os.path.exists(file_path):
                try:
                    with open(file_path, encoding="utf-8") as f:
                        return f.read()
                except UnicodeDecodeError:
                    # 尝试其他编码
                    try:
                        with open(file_path, encoding="gbk") as f:
                            return f.read()
                    except Exception:
                        continue

        return None

    def delete_skill_files(self, skill_id: UUID) -> bool:
        """删除 Skill 的所有文件.

        Args:
            skill_id: Skill ID

        Returns:
            是否成功删除
        """
        skill_dir = self._get_skill_dir(skill_id)

        if os.path.exists(skill_dir):
            shutil.rmtree(skill_dir)
            return True

        return False

    def get_download_path(self, skill_id: UUID) -> str | None:
        """获取 Skill 包的下载路径.

        Args:
            skill_id: Skill ID

        Returns:
            文件路径，如果不存在返回 None
        """
        skill_dir = self._get_skill_dir(skill_id)

        # 尝试查找 package.zip 或其他 zip 文件
        possible_names = ["package.zip", "skill.zip", f"{skill_id}.zip"]

        for name in possible_names:
            file_path = os.path.join(skill_dir, name)
            if os.path.exists(file_path):
                return file_path

        # 如果没有找到，返回默认路径（即使不存在）
        default_path = os.path.join(skill_dir, "package.zip")
        if os.path.exists(default_path):
            return default_path

        # 查找目录下任意 zip 文件
        if os.path.exists(skill_dir):
            for item in os.listdir(skill_dir):
                if item.endswith(".zip"):
                    return os.path.join(skill_dir, item)

        return None

    def save_demo_image(
        self,
        skill_id: UUID,
        content: bytes,
        filename: str,
    ) -> str:
        """保存演示图片.

        Args:
            skill_id: Skill ID
            content: 图片内容
            filename: 文件名

        Returns:
            保存后的文件路径
        """
        skill_dir = self._get_skill_dir(skill_id)
        images_dir = os.path.join(skill_dir, "images")
        os.makedirs(images_dir, exist_ok=True)

        safe_filename = self._sanitize_filename(filename)
        file_path = os.path.join(images_dir, safe_filename)

        with open(file_path, "wb") as f:
            f.write(content)

        return file_path
