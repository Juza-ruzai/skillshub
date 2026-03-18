"""Skill 服务层单元测试."""
from __future__ import annotations

from datetime import UTC, datetime, timedelta
from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

if TYPE_CHECKING:
    from app.services.skill_service import SkillService


class TestSkillService:
    """Skill 服务测试."""

    @pytest.fixture
    def skill_service(self):
        """创建 Skill 服务实例."""
        from app.services.skill_service import SkillService
        return SkillService()

    @pytest.fixture
    async def test_author(self, db_session: AsyncSession) -> dict:
        """创建测试作者（使用唯一标识避免冲突）."""
        from app.core.security import get_password_hash
        from app.models.user import User

        # 生成唯一的用户名和邮箱
        unique_id = str(uuid4())[:8]
        username = f"skillauthor_{unique_id}"
        email = f"skillauthor_{unique_id}@example.com"

        user = User(
            id=uuid4(),
            username=username,
            email=email,
            password_hash=get_password_hash("Author123!"),
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }

    @pytest.mark.asyncio
    async def test_create_skill(
        self, db_session: AsyncSession, skill_service: SkillService, test_author: dict
    ) -> None:
        """测试创建 Skill."""
        skill_data = {
            "name": "PDF Parser",
            "description": "Parse PDF documents",
            "usage_scenario": "Document processing",
            "usage_method": "Upload PDF and run",
            "tags": ["pdf", "parser"],
        }

        skill = await skill_service.create_skill(
            db_session,
            skill_data=skill_data,
            author_id=test_author["id"],
            file_path="uploads/test.zip",
            file_size=1024,
        )

        assert skill.name == "PDF Parser"
        assert skill.author_id == test_author["id"]
        assert skill.file_path == "uploads/test.zip"
        assert skill.tags == ["pdf", "parser"]
        assert skill.is_deleted is False

    @pytest.mark.asyncio
    async def test_get_skill_by_id(
        self, db_session: AsyncSession, skill_service: SkillService, test_author: dict
    ) -> None:
        """测试通过 ID 获取 Skill."""
        from app.models.skill import Skill

        # 创建 Skill
        skill = Skill(
            id=uuid4(),
            name="Test Skill",
            description="Test description",
            usage_scenario="Test usage",
            usage_method="Test method",
            file_path="uploads/test.zip",
            file_size=100,
            author_id=test_author["id"],
        )
        db_session.add(skill)
        await db_session.commit()

        # 获取
        result = await skill_service.get_skill_by_id(db_session, skill.id)

        assert result is not None
        assert result.id == skill.id
        assert result.name == "Test Skill"

    @pytest.mark.asyncio
    async def test_get_skill_by_id_not_found(
        self, db_session: AsyncSession, skill_service: SkillService
    ) -> None:
        """测试获取不存在的 Skill."""
        result = await skill_service.get_skill_by_id(db_session, uuid4())
        assert result is None

    @pytest.mark.asyncio
    async def test_get_skill_by_id_deleted(
        self, db_session: AsyncSession, skill_service: SkillService, test_author: dict
    ) -> None:
        """测试获取已删除的 Skill 返回 None."""
        from app.models.skill import Skill

        skill = Skill(
            id=uuid4(),
            name="Deleted Skill",
            description="Test",
            usage_scenario="Test",
            usage_method="Test",
            file_path="uploads/test.zip",
            file_size=100,
            author_id=test_author["id"],
            is_deleted=True,
        )
        db_session.add(skill)
        await db_session.commit()

        result = await skill_service.get_skill_by_id(db_session, skill.id)
        assert result is None

    @pytest.mark.asyncio
    async def test_update_skill(
        self, db_session: AsyncSession, skill_service: SkillService, test_author: dict
    ) -> None:
        """测试更新 Skill."""
        from app.models.skill import Skill

        # 创建 Skill
        skill = Skill(
            id=uuid4(),
            name="Old Name",
            description="Old description",
            usage_scenario="Old usage",
            usage_method="Old method",
            file_path="uploads/test.zip",
            file_size=100,
            author_id=test_author["id"],
        )
        db_session.add(skill)
        await db_session.commit()

        # 更新
        updated = await skill_service.update_skill(
            db_session,
            skill=skill,
            update_data={"name": "New Name", "description": "New description"},
        )

        assert updated.name == "New Name"
        assert updated.description == "New description"
        # 未更新的字段保持不变
        assert updated.usage_scenario == "Old usage"

    @pytest.mark.asyncio
    async def test_delete_skill(
        self, db_session: AsyncSession, skill_service: SkillService, test_author: dict
    ) -> None:
        """测试软删除 Skill."""
        from app.models.skill import Skill

        # 创建 Skill
        skill = Skill(
            id=uuid4(),
            name="To Delete",
            description="Test",
            usage_scenario="Test",
            usage_method="Test",
            file_path="uploads/test.zip",
            file_size=100,
            author_id=test_author["id"],
        )
        db_session.add(skill)
        await db_session.commit()

        # 删除
        result = await skill_service.delete_skill(db_session, skill)

        assert result is True
        assert skill.is_deleted is True

    @pytest.mark.asyncio
    async def test_search_skills(
        self, db_session: AsyncSession, skill_service: SkillService, test_author: dict
    ) -> None:
        """测试搜索 Skill."""
        from app.models.skill import Skill

        # 创建多个 Skills
        skills = [
            Skill(
                id=uuid4(),
                name="PDF Parser",
                description="Parse PDF files",
                usage_scenario="Document processing",
                usage_method="Run script",
                file_path="uploads/pdf.zip",
                file_size=100,
                author_id=test_author["id"],
                tags=["pdf", "parser"],
            ),
            Skill(
                id=uuid4(),
                name="Image Converter",
                description="Convert images",
                usage_scenario="Image processing",
                usage_method="Run script",
                file_path="uploads/img.zip",
                file_size=200,
                author_id=test_author["id"],
                tags=["image", "converter"],
            ),
            Skill(
                id=uuid4(),
                name="PDF Merger",
                description="Merge PDF files",
                usage_scenario="Document processing",
                usage_method="Run script",
                file_path="uploads/merge.zip",
                file_size=150,
                author_id=test_author["id"],
                tags=["pdf", "merge"],
            ),
        ]
        db_session.add_all(skills)
        await db_session.commit()

        # 搜索 "pdf"
        results, total = await skill_service.search_skills(
            db_session, search="pdf", page=1, page_size=10
        )

        # 至少找到 2 个包含 "pdf" 的结果（可能有其他测试数据）
        assert total >= 2
        assert len(results) >= 2
        assert all("pdf" in s.name.lower() or "pdf" in s.description.lower() for s in results)

    @pytest.mark.asyncio
    async def test_filter_by_tag(
        self, db_session: AsyncSession, skill_service: SkillService, test_author: dict
    ) -> None:
        """测试按标签筛选."""
        from app.models.skill import Skill

        # 创建带标签的 Skills
        skills = [
            Skill(
                id=uuid4(),
                name="Python Skill",
                description="Python test",
                usage_scenario="Test",
                usage_method="Run",
                file_path="uploads/s1.zip",
                file_size=100,
                author_id=test_author["id"],
                tags=["python", "script"],
            ),
            Skill(
                id=uuid4(),
                name="JS Skill",
                description="JS test",
                usage_scenario="Test",
                usage_method="Run",
                file_path="uploads/s2.zip",
                file_size=100,
                author_id=test_author["id"],
                tags=["javascript", "script"],
            ),
        ]
        db_session.add_all(skills)
        await db_session.commit()

        # 筛选 python 标签
        results, total = await skill_service.search_skills(
            db_session, tag="python", page=1, page_size=10
        )

        assert total == 1
        assert results[0].name == "Python Skill"

    @pytest.mark.asyncio
    async def test_calculate_hot_score(self, db_session: AsyncSession) -> None:
        """测试热度分数计算."""
        from app.models.skill import Skill
        from app.services.skill_service import calculate_hot_score

        # 创建一个 Skill
        skill = Skill(
            id=uuid4(),
            name="Hot Skill",
            description="Test",
            usage_scenario="Test",
            usage_method="Test",
            file_path="uploads/test.zip",
            file_size=100,
            author_id=uuid4(),
            rating_avg=Decimal("4.5"),
            download_count=10,
            created_at=datetime.now(UTC),
        )

        score = calculate_hot_score(skill)

        # 预期: (4.5 * 20) + (10 * 2) - (0 * 1) = 90 + 20 = 110
        assert score == 110

    @pytest.mark.asyncio
    async def test_calculate_hot_score_with_time_decay(
        self, db_session: AsyncSession
    ) -> None:
        """测试热度分数的时间衰减."""
        from app.models.skill import Skill
        from app.services.skill_service import calculate_hot_score

        # 创建一个 10 天前的 Skill
        skill = Skill(
            id=uuid4(),
            name="Old Skill",
            description="Test",
            usage_scenario="Test",
            usage_method="Test",
            file_path="uploads/test.zip",
            file_size=100,
            author_id=uuid4(),
            rating_avg=Decimal("5.0"),
            download_count=0,
            created_at=datetime.now(UTC) - timedelta(days=10),
        )

        score = calculate_hot_score(skill)

        # 预期: (5.0 * 20) + (0 * 2) - (10 * 1) = 100 - 10 = 90
        assert score == 90

    @pytest.mark.asyncio
    async def test_calculate_hot_score_minimum_zero(
        self, db_session: AsyncSession
    ) -> None:
        """测试热度分数最低为 0."""
        from app.models.skill import Skill
        from app.services.skill_service import calculate_hot_score

        # 创建一个很老的 Skill
        skill = Skill(
            id=uuid4(),
            name="Very Old Skill",
            description="Test",
            usage_scenario="Test",
            usage_method="Test",
            file_path="uploads/test.zip",
            file_size=100,
            author_id=uuid4(),
            rating_avg=Decimal("0.0"),
            download_count=0,
            created_at=datetime.now(UTC) - timedelta(days=1000),
        )

        score = calculate_hot_score(skill)

        # 最低为 0
        assert score == 0

    @pytest.mark.asyncio
    async def test_increment_download_count(
        self, db_session: AsyncSession, skill_service: SkillService, test_author: dict
    ) -> None:
        """测试增加下载计数."""
        from app.models.skill import Skill

        skill = Skill(
            id=uuid4(),
            name="Download Test",
            description="Test",
            usage_scenario="Test",
            usage_method="Test",
            file_path="uploads/test.zip",
            file_size=100,
            author_id=test_author["id"],
            download_count=5,
        )
        db_session.add(skill)
        await db_session.commit()

        await skill_service.increment_download_count(db_session, skill.id)

        # 刷新
        await db_session.refresh(skill)
        assert skill.download_count == 6

    @pytest.mark.asyncio
    async def test_increment_view_count(
        self, db_session: AsyncSession, skill_service: SkillService, test_author: dict
    ) -> None:
        """测试增加浏览计数."""
        from app.models.skill import Skill

        skill = Skill(
            id=uuid4(),
            name="View Test",
            description="Test",
            usage_scenario="Test",
            usage_method="Test",
            file_path="uploads/test.zip",
            file_size=100,
            author_id=test_author["id"],
            view_count=10,
        )
        db_session.add(skill)
        await db_session.commit()

        await skill_service.increment_view_count(db_session, skill.id)

        await db_session.refresh(skill)
        assert skill.view_count == 11

    @pytest.mark.asyncio
    async def test_get_trending_skills(
        self, db_session: AsyncSession, skill_service: SkillService, test_author: dict
    ) -> None:
        """测试获取本周热门 Skills."""
        from app.models.skill import Skill

        # 创建近期和早期的 Skills
        recent_skill = Skill(
            id=uuid4(),
            name="Recent Skill",
            description="Test",
            usage_scenario="Test",
            usage_method="Test",
            file_path="uploads/r.zip",
            file_size=100,
            author_id=test_author["id"],
            download_count=100,  # 最近下载多
            created_at=datetime.now(UTC) - timedelta(days=3),
        )
        old_skill = Skill(
            id=uuid4(),
            name="Old Skill",
            description="Test",
            usage_scenario="Test",
            usage_method="Test",
            file_path="uploads/o.zip",
            file_size=100,
            author_id=test_author["id"],
            download_count=5,
            created_at=datetime.now(UTC) - timedelta(days=10),
        )
        db_session.add_all([recent_skill, old_skill])
        await db_session.commit()

        results = await skill_service.get_trending_skills(db_session, limit=10)

        # 应该返回按近期下载排序的结果
        assert len(results) > 0

    @pytest.mark.asyncio
    async def test_get_top_rated_skills(
        self, db_session: AsyncSession, skill_service: SkillService, test_author: dict
    ) -> None:
        """测试获取评分最高 Skills."""
        from app.models.skill import Skill

        # 创建不同评分的 Skills
        high_rated = Skill(
            id=uuid4(),
            name="High Rated",
            description="Test",
            usage_scenario="Test",
            usage_method="Test",
            file_path="uploads/h.zip",
            file_size=100,
            author_id=test_author["id"],
            rating_avg=Decimal("4.8"),
            rating_count=5,
        )
        low_rated = Skill(
            id=uuid4(),
            name="Low Rated",
            description="Test",
            usage_scenario="Test",
            usage_method="Test",
            file_path="uploads/l.zip",
            file_size=100,
            author_id=test_author["id"],
            rating_avg=Decimal("2.0"),
            rating_count=5,
        )
        no_rating = Skill(
            id=uuid4(),
            name="No Rating",
            description="Test",
            usage_scenario="Test",
            usage_method="Test",
            file_path="uploads/n.zip",
            file_size=100,
            author_id=test_author["id"],
            rating_avg=Decimal("0.0"),
            rating_count=0,
        )
        db_session.add_all([high_rated, low_rated, no_rating])
        await db_session.commit()

        results = await skill_service.get_top_rated_skills(db_session, limit=10)

        # 应该按评分排序
        if len(results) >= 2:
            assert results[0].rating_avg >= results[1].rating_avg

    @pytest.mark.asyncio
    async def test_get_most_downloaded_skills(
        self, db_session: AsyncSession, skill_service: SkillService, test_author: dict
    ) -> None:
        """测试获取下载最多 Skills."""
        from app.models.skill import Skill

        # 创建不同下载量的 Skills
        popular = Skill(
            id=uuid4(),
            name="Popular",
            description="Test",
            usage_scenario="Test",
            usage_method="Test",
            file_path="uploads/p.zip",
            file_size=100,
            author_id=test_author["id"],
            download_count=1000,
        )
        unpopular = Skill(
            id=uuid4(),
            name="Unpopular",
            description="Test",
            usage_scenario="Test",
            usage_method="Test",
            file_path="uploads/u.zip",
            file_size=100,
            author_id=test_author["id"],
            download_count=10,
        )
        db_session.add_all([popular, unpopular])
        await db_session.commit()

        results = await skill_service.get_most_downloaded_skills(db_session, limit=10)

        # 应该按下载量排序
        if len(results) >= 2:
            assert results[0].download_count >= results[1].download_count
