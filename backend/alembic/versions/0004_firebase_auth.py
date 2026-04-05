"""Switch to Firebase auth: add firebase_uid, drop hashed_password, drop password_reset_tokens

Revision ID: 0004
Revises: 0003
Create Date: 2026-04-05
"""
from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop password_reset_tokens table
    op.drop_table("password_reset_tokens")

    # Add firebase_uid to users
    op.add_column("users", sa.Column("firebase_uid", sa.String(128), nullable=True))
    op.create_unique_constraint("uq_users_firebase_uid", "users", ["firebase_uid"])
    op.create_index("ix_users_firebase_uid", "users", ["firebase_uid"])

    # Drop hashed_password (no longer needed)
    op.drop_column("users", "hashed_password")


def downgrade() -> None:
    op.add_column("users", sa.Column("hashed_password", sa.String(255), nullable=False, server_default=""))
    op.drop_index("ix_users_firebase_uid", table_name="users")
    op.drop_constraint("uq_users_firebase_uid", "users", type_="unique")
    op.drop_column("users", "firebase_uid")
    op.create_table(
        "password_reset_tokens",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("token", sa.String(64), unique=True, nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
