"""Add Setu payment fields to escrow

Revision ID: add_setu_fields
Revises: f8497a805f5e
Create Date: 2025-11-26 06:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_setu_fields'
down_revision = 'f8497a805f5e'  # Points to previous migration
branch_labels = None
depends_on = None


def upgrade():
    # Add Setu-specific fields to escrows table
    op.add_column('escrows', sa.Column('setu_payment_id', sa.String(length=100), nullable=True))
    op.add_column('escrows', sa.Column('setu_payout_id', sa.String(length=100), nullable=True))
    op.add_column('escrows', sa.Column('setu_refund_id', sa.String(length=100), nullable=True))


def downgrade():
    # Remove Setu fields if rolling back
    op.drop_column('escrows', 'setu_refund_id')
    op.drop_column('escrows', 'setu_payout_id')
    op.drop_column('escrows', 'setu_payment_id')
