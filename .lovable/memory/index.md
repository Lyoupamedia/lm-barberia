# Project Memory

## Core
LM Barberia salon management dashboard. Dark theme default, amber/gold primary (#E69500). Space Grotesk headings, Inter body.
Lovable Cloud backend with RLS: admin sees all, barbers see own data only.
Roles stored in user_roles table with has_role() security definer function.

## Memories
- [Design tokens](mem://design/tokens) — Full color palette, fonts, dark/light theme
- [Database schema](mem://features/database) — Tables: profiles, user_roles, clients, appointments, services, income, expenses, invoices, invoice_items
- [Auth flow](mem://features/auth) — Email/password login, auto-confirm enabled, role-based routing (admin/barber)
