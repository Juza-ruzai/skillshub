"""add is_active to users and create download_logs table

修订 ID: a1b2c3d4e5f6
父修订: 5a03cef7e840
创建时间: 2026-03-21

变更说明:
- users 表新增 is_active 字段（账号启用/禁用）
- 新建 download_logs 表（记录下载用户）
"""

import sqlalchemy as sa
import sqlmodel

from alembic import op

# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f6"
down_revision = "5a03cef7e840"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 为 users 表添加 is_active 字段
    # server_default='true' 保证已有行不会因 NOT NULL 约束失败
    op.add_column(
        "users",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
    )

    # 创建 download_logs 表
    op.create_table(
        "download_logs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("skill_id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=True),
        sa.Column(
            "ip_address",
            sqlmodel.sql.sqltypes.AutoString(length=45),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["skill_id"], ["skills.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_download_logs_skill_id"),
        "download_logs",
        ["skill_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_download_logs_user_id"),
        "download_logs",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_download_logs_user_id"), table_name="download_logs")
    op.drop_index(op.f("ix_download_logs_skill_id"), table_name="download_logs")
    op.drop_table("download_logs")
    op.drop_column("users", "is_active")
