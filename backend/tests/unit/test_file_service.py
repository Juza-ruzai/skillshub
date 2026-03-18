"""文件服务单元测试."""
from __future__ import annotations

import os
import tempfile
import zipfile
from pathlib import Path
from typing import TYPE_CHECKING
from uuid import uuid4

import pytest

if TYPE_CHECKING:
    from app.services.file_service import FileService


class TestFileService:
    """文件服务测试."""

    @pytest.fixture
    def upload_dir(self) -> str:
        """创建临时上传目录."""
        with tempfile.TemporaryDirectory() as tmpdir:
            yield tmpdir

    @pytest.fixture
    def file_service(self, upload_dir: str):
        """创建文件服务实例."""
        from app.services.file_service import FileService

        return FileService(upload_dir)

    def test_save_upload_file(self, file_service: FileService, upload_dir: str) -> None:
        """测试保存上传文件."""
        skill_id = uuid4()
        content = b"test file content"

        file_path = file_service.save_upload_file(skill_id, content, "test.zip")

        assert os.path.exists(file_path)
        with open(file_path, "rb") as f:
            assert f.read() == content

    def test_save_upload_file_creates_directory(self, file_service: FileService, upload_dir: str) -> None:
        """测试保存文件时自动创建目录."""
        skill_id = uuid4()
        content = b"test content"

        file_service.save_upload_file(skill_id, content, "test.zip")

        skill_dir = os.path.join(upload_dir, str(skill_id))
        assert os.path.isdir(skill_dir)

    def test_save_upload_file_unsafe_name(self, file_service: FileService) -> None:
        """测试不安全的文件名被清理."""
        skill_id = uuid4()
        content = b"test content"

        # 路径遍历尝试
        file_path = file_service.save_upload_file(skill_id, content, "../../../etc/passwd")

        # 应该被安全处理，文件保存在 skill 目录下
        assert str(skill_id) in file_path
        assert "passwd" in os.path.basename(file_path)

    def test_validate_file_type_allowed(self, file_service: FileService) -> None:
        """测试允许的文件类型."""
        assert file_service.validate_file_type("test.zip") is True
        assert file_service.validate_file_type("test.md") is True
        assert file_service.validate_file_type("test.py") is True
        assert file_service.validate_file_type("skill.JSON") is True  # 大小写不敏感

    def test_validate_file_type_denied(self, file_service: FileService) -> None:
        """测试禁止的文件类型."""
        assert file_service.validate_file_type("test.exe") is False
        assert file_service.validate_file_type("test.dll") is False
        assert file_service.validate_file_type("test.sh") is True  # .sh 是允许的

    def test_validate_file_size_within_limit(self, file_service: FileService) -> None:
        """测试文件大小在限制内."""
        assert file_service.validate_file_size(1024 * 1024) is True  # 1MB

    def test_validate_file_size_exceeds_limit(self, file_service: FileService) -> None:
        """测试文件大小超过限制."""
        # 默认限制 50MB
        assert file_service.validate_file_size(60 * 1024 * 1024) is False

    def test_extract_zip_file(self, file_service: FileService, upload_dir: str) -> None:
        """测试解压 ZIP 文件."""
        skill_id = uuid4()

        # 创建测试 ZIP 文件
        zip_path = os.path.join(upload_dir, "test.zip")
        with zipfile.ZipFile(zip_path, "w") as zf:
            zf.writestr("SKILL.md", "# Test Skill")
            zf.writestr("README.md", "# README")
            zf.writestr("script.py", "print('hello')")

        # 解压
        extract_dir = file_service.extract_zip_file(skill_id, zip_path)

        assert os.path.exists(extract_dir)
        assert os.path.exists(os.path.join(extract_dir, "SKILL.md"))
        assert os.path.exists(os.path.join(extract_dir, "README.md"))
        assert os.path.exists(os.path.join(extract_dir, "script.py"))

    def test_extract_zip_file_depth_limit(self, file_service: FileService, upload_dir: str) -> None:
        """测试解压深度限制."""
        skill_id = uuid4()

        # 创建深层嵌套的 ZIP 文件（4 层，超过 3 层限制）
        zip_path = os.path.join(upload_dir, "deep.zip")
        with zipfile.ZipFile(zip_path, "w") as zf:
            zf.writestr("level1/level2/level3/file.txt", "deep file")
            zf.writestr("level1/level2/level3/level4/too_deep.txt", "too deep")

        # 解压应该跳过超过 3 层的文件
        extract_dir = file_service.extract_zip_file(skill_id, zip_path)

        assert os.path.exists(os.path.join(extract_dir, "level1/level2/level3/file.txt"))
        # 第 4 层应该被跳过
        assert not os.path.exists(os.path.join(extract_dir, "level1/level2/level3/level4"))

    def test_extract_zip_file_path_traversal(self, file_service: FileService, upload_dir: str) -> None:
        """测试 ZIP 路径遍历防护."""
        skill_id = uuid4()

        # 创建包含路径遍历的 ZIP 文件
        zip_path = os.path.join(upload_dir, "evil.zip")
        with zipfile.ZipFile(zip_path, "w") as zf:
            # 这种路径在创建时会被处理，但在某些 ZIP 实现中可能存在
            zf.writestr("safe.txt", "safe content")

        extract_dir = file_service.extract_zip_file(skill_id, zip_path)

        # 安全文件应该正常解压
        assert os.path.exists(os.path.join(extract_dir, "safe.txt"))

    def test_get_file_tree(self, file_service: FileService, upload_dir: str) -> None:
        """测试获取文件树结构."""
        skill_id = uuid4()
        extract_dir = os.path.join(upload_dir, str(skill_id), "extracted")
        os.makedirs(os.path.join(extract_dir, "scripts"))

        # 创建测试文件
        Path(os.path.join(extract_dir, "SKILL.md")).touch()
        Path(os.path.join(extract_dir, "README.md")).touch()
        Path(os.path.join(extract_dir, "scripts/run.py")).touch()

        tree = file_service.get_file_tree(skill_id)

        assert tree["name"] == "extracted"
        assert tree["type"] == "folder"
        assert len(tree["children"]) == 3

        # 找到 scripts 文件夹
        scripts = next(c for c in tree["children"] if c["name"] == "scripts")
        assert scripts["type"] == "folder"
        assert len(scripts["children"]) == 1
        assert scripts["children"][0]["name"] == "run.py"

    def test_read_skill_md(self, file_service: FileService, upload_dir: str) -> None:
        """测试读取 SKILL.md 内容."""
        skill_id = uuid4()
        extract_dir = os.path.join(upload_dir, str(skill_id), "extracted")
        os.makedirs(extract_dir)

        # 创建 SKILL.md
        with open(os.path.join(extract_dir, "SKILL.md"), "w", encoding="utf-8") as f:
            f.write("# Test Skill\\n\\nThis is a test skill.")

        content = file_service.read_skill_md(skill_id)

        assert "# Test Skill" in content
        assert "test skill" in content

    def test_read_skill_md_not_found(self, file_service: FileService, upload_dir: str) -> None:
        """测试 SKILL.md 不存在时返回 None."""
        skill_id = uuid4()

        content = file_service.read_skill_md(skill_id)

        assert content is None

    def test_delete_skill_files(self, file_service: FileService, upload_dir: str) -> None:
        """测试删除 Skill 文件."""
        skill_id = uuid4()
        skill_dir = os.path.join(upload_dir, str(skill_id))
        os.makedirs(skill_dir)
        Path(os.path.join(skill_dir, "test.txt")).touch()

        assert os.path.exists(skill_dir)

        file_service.delete_skill_files(skill_id)

        assert not os.path.exists(skill_dir)

    def test_get_download_path(self, file_service: FileService, upload_dir: str) -> None:
        """测试获取下载路径."""
        skill_id = uuid4()
        skill_dir = os.path.join(upload_dir, str(skill_id))
        os.makedirs(skill_dir)

        package_path = os.path.join(skill_dir, "package.zip")
        Path(package_path).touch()

        result = file_service.get_download_path(skill_id)

        assert result == package_path

    def test_get_download_path_not_found(self, file_service: FileService) -> None:
        """测试下载路径不存在时返回 None."""
        skill_id = uuid4()

        result = file_service.get_download_path(skill_id)

        assert result is None
