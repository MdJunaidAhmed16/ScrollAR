"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2026-04-02
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("username", sa.String(50), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_username", "users", ["username"])

    op.create_table(
        "papers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("arxiv_id", sa.String(50), nullable=False, unique=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("abstract", sa.Text(), nullable=False),
        sa.Column("authors", postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column("categories", postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("pdf_url", sa.String(500), nullable=False),
        sa.Column("arxiv_url", sa.String(500), nullable=False),
        sa.Column("ingested_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_papers_arxiv_id", "papers", ["arxiv_id"])
    op.create_index("ix_papers_published_at", "papers", ["published_at"])

    op.create_table(
        "cards",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("paper_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("papers.id"), nullable=False, unique=True),
        sa.Column("hook", sa.String(200), nullable=False),
        sa.Column("eli5", sa.Text(), nullable=False),
        sa.Column("key_finding", sa.Text(), nullable=False),
        sa.Column("why_it_matters", sa.Text(), nullable=False),
        sa.Column("tags", postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column("difficulty", sa.String(20), nullable=False, server_default="intermediate"),
        sa.Column("key_contributions", postgresql.JSONB(), nullable=False),
        sa.Column("model_version", sa.String(50), nullable=False),
        sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.execute("CREATE INDEX ix_cards_tags ON cards USING GIN(tags)")

    op.create_table(
        "swipe_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("paper_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("papers.id"), nullable=False),
        sa.Column("direction", sa.String(10), nullable=False),
        sa.Column("swiped_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "paper_id", name="uq_swipe_user_paper"),
    )
    op.create_index("ix_swipe_user_id", "swipe_events", ["user_id"])
    op.create_index("ix_swipe_paper_id", "swipe_events", ["paper_id"])

    op.create_table(
        "bookmarks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("paper_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("papers.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "paper_id", name="uq_bookmark_user_paper"),
    )
    op.create_index("ix_bookmark_user_id", "bookmarks", ["user_id"])

    op.create_table(
        "likes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("paper_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("papers.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "paper_id", name="uq_like_user_paper"),
    )
    op.create_index("ix_like_user_id", "likes", ["user_id"])


def downgrade() -> None:
    op.drop_table("likes")
    op.drop_table("bookmarks")
    op.drop_table("swipe_events")
    op.drop_table("cards")
    op.drop_table("papers")
    op.drop_table("users")
