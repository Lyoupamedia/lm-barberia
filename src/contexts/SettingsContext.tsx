import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Translations = Record<string, Record<string, string>>;

const translations: Translations = {
  en: {
    dashboard: "Dashboard", clients: "Clients", appointments: "Appointments",
    income: "Income", expenses: "Expenses", invoices: "Invoices", team: "Team",
    settings: "Settings", my_clients: "My Clients", my_appointments: "My Appointments",
    my_income: "My Income", sign_out: "Sign Out", salon_manager: "Salon Manager",
    menu: "Menu", today: "Today", total_income: "Total Income", total_expenses: "Total Expenses",
    profit: "Profit", top_barber: "Top Barber", recent_appointments: "Recent Appointments",
    recent_clients: "Recent Clients", view_all: "View all", income_overview: "Income Overview",
    no_appointments_yet: "No appointments yet", no_clients_yet: "No clients yet",
    record_income: "Record Income", edit_income: "Edit Income", service: "Service",
    client: "Client", amount: "Amount", date: "Date", description: "Description",
    save: "Save", update: "Update", actions: "Actions", loading: "Loading...",
    no_income_recorded: "No income recorded yet", commission: "Commission",
    my_commission: "My Commission", add_expense: "Add Expense", edit_expense: "Edit Expense",
    category: "Category", no_expenses_recorded: "No expenses recorded",
    create_invoice: "Create Invoice", new_invoice: "New Invoice", services: "Services",
    total: "Total", status: "Status", no_invoices_yet: "No invoices yet",
    mark_sent: "Mark Sent", mark_paid: "Mark Paid", add_client: "Add Client",
    edit_client: "Edit Client", new_client: "New Client", name: "Name", phone: "Phone",
    notes: "Notes", new_appointment: "New Appointment", edit_appointment: "Edit Appointment",
    barber: "Barber", date_time: "Date & Time", pending: "Pending", completed: "Completed",
    cancelled: "Cancelled", no_appointments: "No appointments yet",
    add_barber: "Add Barber", create_barber_account: "Create Barber Account",
    full_name: "Full Name", email: "Email", password: "Password",
    commission_rate: "Commission Rate", create_barber: "Create Barber",
    edit_profile: "Edit Profile", update_profile: "Update Profile",
    member: "Member", role: "Role", total_commission: "Commission Earned",
    assign_role: "Assign Role", no_team_members: "No team members yet",
    top_performer: "Top Performer", performer: "Performer", appts: "Appts",
    save_all_settings: "Save All Settings", saving: "Saving...",
    my_profile: "My Profile", manage_personal_info: "Manage your personal information",
    business_information: "Business Information", your_salon_details: "Your salon details",
    business_name: "Business Name", business_phone: "Business Phone",
    business_email: "Business Email", address: "Address",
    language_currency: "Language & Currency", regional_preferences: "Regional preferences",
    language: "Language", currency: "Currency",
    dashboard_sections: "Dashboard Sections", toggle_sections: "Toggle which sections are visible in the sidebar",
    show_in_nav: "Show {section} in navigation", profile_updated: "Profile updated",
    settings_saved: "Settings saved", save_profile: "Save Profile",
    admin: "Admin", user: "User", select_service: "Select service",
    select_client: "Select client", select_barber: "Select barber",
    optional: "optional", creating: "Creating...", no_role: "No role",
    delete: "Delete", edit: "Edit", add_service: "Add Service", edit_service: "Edit Service",
    service_added: "Service added", service_updated: "Service updated", no_services: "No services yet",
    price: "Price", duration: "Duration", minutes: "min",
    my_own_income: "My Own Income", team_commission: "Team Commission",
    admin_share: "Admin Share (50%)", barber_name: "Barber", all_income: "All Income",
    team_income_total: "Team Income", my_work: "My Work",
  },
  es: {
    dashboard: "Panel", clients: "Clientes", appointments: "Citas",
    income: "Ingresos", expenses: "Gastos", invoices: "Facturas", team: "Equipo",
    settings: "Configuración", my_clients: "Mis Clientes", my_appointments: "Mis Citas",
    my_income: "Mis Ingresos", sign_out: "Cerrar Sesión", salon_manager: "Gestor de Salón",
    menu: "Menú", today: "Hoy", total_income: "Ingresos Totales", total_expenses: "Gastos Totales",
    profit: "Ganancia", top_barber: "Mejor Barbero", recent_appointments: "Citas Recientes",
    recent_clients: "Clientes Recientes", view_all: "Ver todo", income_overview: "Resumen de Ingresos",
    no_appointments_yet: "Sin citas aún", no_clients_yet: "Sin clientes aún",
    record_income: "Registrar Ingreso", edit_income: "Editar Ingreso", service: "Servicio",
    client: "Cliente", amount: "Monto", date: "Fecha", description: "Descripción",
    save: "Guardar", update: "Actualizar", actions: "Acciones", loading: "Cargando...",
    no_income_recorded: "Sin ingresos registrados", commission: "Comisión",
    my_commission: "Mi Comisión", add_expense: "Agregar Gasto", edit_expense: "Editar Gasto",
    category: "Categoría", no_expenses_recorded: "Sin gastos registrados",
    create_invoice: "Crear Factura", new_invoice: "Nueva Factura", services: "Servicios",
    total: "Total", status: "Estado", no_invoices_yet: "Sin facturas aún",
    mark_sent: "Marcar Enviada", mark_paid: "Marcar Pagada", add_client: "Agregar Cliente",
    edit_client: "Editar Cliente", new_client: "Nuevo Cliente", name: "Nombre", phone: "Teléfono",
    notes: "Notas", new_appointment: "Nueva Cita", edit_appointment: "Editar Cita",
    barber: "Barbero", date_time: "Fecha y Hora", pending: "Pendiente", completed: "Completada",
    cancelled: "Cancelada", no_appointments: "Sin citas aún",
    add_barber: "Agregar Barbero", create_barber_account: "Crear Cuenta de Barbero",
    full_name: "Nombre Completo", email: "Correo", password: "Contraseña",
    commission_rate: "Tasa de Comisión", create_barber: "Crear Barbero",
    edit_profile: "Editar Perfil", update_profile: "Actualizar Perfil",
    member: "Miembro", role: "Rol", total_commission: "Comisión Ganada",
    assign_role: "Asignar Rol", no_team_members: "Sin miembros del equipo",
    top_performer: "Mejor Desempeño", performer: "Desempeño", appts: "Citas",
    save_all_settings: "Guardar Configuración", saving: "Guardando...",
    my_profile: "Mi Perfil", manage_personal_info: "Gestiona tu información personal",
    business_information: "Información del Negocio", your_salon_details: "Detalles de tu salón",
    business_name: "Nombre del Negocio", business_phone: "Teléfono del Negocio",
    business_email: "Correo del Negocio", address: "Dirección",
    language_currency: "Idioma y Moneda", regional_preferences: "Preferencias regionales",
    language: "Idioma", currency: "Moneda",
    dashboard_sections: "Secciones del Panel", toggle_sections: "Activar o desactivar secciones visibles en el menú",
    show_in_nav: "Mostrar {section} en navegación", profile_updated: "Perfil actualizado",
    settings_saved: "Configuración guardada", save_profile: "Guardar Perfil",
    admin: "Admin", user: "Usuario", select_service: "Seleccionar servicio",
    select_client: "Seleccionar cliente", select_barber: "Seleccionar barbero",
    optional: "opcional", creating: "Creando...", no_role: "Sin rol",
    delete: "Eliminar", edit: "Editar", add_service: "Agregar Servicio", edit_service: "Editar Servicio",
    service_added: "Servicio agregado", service_updated: "Servicio actualizado", no_services: "Sin servicios aún",
    price: "Precio", duration: "Duración", minutes: "min",
    my_own_income: "Mis Ingresos Propios", team_commission: "Comisión del Equipo",
    admin_share: "Parte Admin (50%)", barber_name: "Barbero", all_income: "Todos los Ingresos",
    team_income_total: "Ingresos del Equipo", my_work: "Mi Trabajo",
  },
  fr: {
    dashboard: "Tableau de bord", clients: "Clients", appointments: "Rendez-vous",
    income: "Revenus", expenses: "Dépenses", invoices: "Factures", team: "Équipe",
    settings: "Paramètres", my_clients: "Mes Clients", my_appointments: "Mes Rendez-vous",
    my_income: "Mes Revenus", sign_out: "Déconnexion", salon_manager: "Gestionnaire de Salon",
    menu: "Menu", today: "Aujourd'hui", total_income: "Revenus Totaux", total_expenses: "Dépenses Totales",
    profit: "Bénéfice", top_barber: "Meilleur Barbier", recent_appointments: "Rendez-vous Récents",
    recent_clients: "Clients Récents", view_all: "Voir tout", income_overview: "Aperçu des Revenus",
    no_appointments_yet: "Aucun rendez-vous", no_clients_yet: "Aucun client",
    record_income: "Enregistrer Revenu", edit_income: "Modifier Revenu", service: "Service",
    client: "Client", amount: "Montant", date: "Date", description: "Description",
    save: "Enregistrer", update: "Mettre à jour", actions: "Actions", loading: "Chargement...",
    no_income_recorded: "Aucun revenu enregistré", commission: "Commission",
    my_commission: "Ma Commission", add_expense: "Ajouter Dépense", edit_expense: "Modifier Dépense",
    category: "Catégorie", no_expenses_recorded: "Aucune dépense enregistrée",
    create_invoice: "Créer Facture", new_invoice: "Nouvelle Facture", services: "Services",
    total: "Total", status: "Statut", no_invoices_yet: "Aucune facture",
    mark_sent: "Marquer Envoyée", mark_paid: "Marquer Payée", add_client: "Ajouter Client",
    edit_client: "Modifier Client", new_client: "Nouveau Client", name: "Nom", phone: "Téléphone",
    notes: "Notes", new_appointment: "Nouveau Rendez-vous", edit_appointment: "Modifier Rendez-vous",
    barber: "Barbier", date_time: "Date et Heure", pending: "En attente", completed: "Terminé",
    cancelled: "Annulé", no_appointments: "Aucun rendez-vous",
    add_barber: "Ajouter Barbier", create_barber_account: "Créer Compte Barbier",
    full_name: "Nom Complet", email: "E-mail", password: "Mot de passe",
    commission_rate: "Taux de Commission", create_barber: "Créer Barbier",
    edit_profile: "Modifier Profil", update_profile: "Mettre à jour Profil",
    member: "Membre", role: "Rôle", total_commission: "Commission Gagnée",
    assign_role: "Attribuer Rôle", no_team_members: "Aucun membre",
    top_performer: "Meilleur Performance", performer: "Performance", appts: "RDV",
    save_all_settings: "Sauvegarder", saving: "Sauvegarde...",
    my_profile: "Mon Profil", manage_personal_info: "Gérer vos informations personnelles",
    business_information: "Informations Entreprise", your_salon_details: "Détails du salon",
    business_name: "Nom de l'Entreprise", business_phone: "Téléphone Entreprise",
    business_email: "E-mail Entreprise", address: "Adresse",
    language_currency: "Langue et Devise", regional_preferences: "Préférences régionales",
    language: "Langue", currency: "Devise",
    dashboard_sections: "Sections du Tableau", toggle_sections: "Basculer les sections visibles",
    show_in_nav: "Afficher {section} dans la navigation", profile_updated: "Profil mis à jour",
    settings_saved: "Paramètres sauvegardés", save_profile: "Sauvegarder Profil",
    admin: "Admin", user: "Utilisateur", select_service: "Choisir service",
    select_client: "Choisir client", select_barber: "Choisir barbier",
    optional: "optionnel", creating: "Création...", no_role: "Sans rôle",
    delete: "Supprimer", edit: "Modifier", add_service: "Ajouter Service", edit_service: "Modifier Service",
    service_added: "Service ajouté", service_updated: "Service mis à jour", no_services: "Aucun service",
    price: "Prix", duration: "Durée", minutes: "min",
    my_own_income: "Mes Propres Revenus", team_commission: "Commission Équipe",
    admin_share: "Part Admin (50%)", barber_name: "Barbier", all_income: "Tous les Revenus",
    team_income_total: "Revenus Équipe", my_work: "Mon Travail",
  },
  pt: {
    dashboard: "Painel", clients: "Clientes", appointments: "Agendamentos",
    income: "Receitas", expenses: "Despesas", invoices: "Faturas", team: "Equipe",
    settings: "Configurações", my_clients: "Meus Clientes", my_appointments: "Meus Agendamentos",
    my_income: "Minhas Receitas", sign_out: "Sair", salon_manager: "Gerenciador de Salão",
    menu: "Menu", today: "Hoje", total_income: "Receita Total", total_expenses: "Despesas Totais",
    profit: "Lucro", top_barber: "Melhor Barbeiro", recent_appointments: "Agendamentos Recentes",
    recent_clients: "Clientes Recentes", view_all: "Ver tudo", income_overview: "Visão de Receitas",
    no_appointments_yet: "Sem agendamentos", no_clients_yet: "Sem clientes",
    record_income: "Registrar Receita", edit_income: "Editar Receita", service: "Serviço",
    client: "Cliente", amount: "Valor", date: "Data", description: "Descrição",
    save: "Salvar", update: "Atualizar", actions: "Ações", loading: "Carregando...",
    no_income_recorded: "Sem receitas registradas", commission: "Comissão",
    my_commission: "Minha Comissão", add_expense: "Adicionar Despesa", edit_expense: "Editar Despesa",
    category: "Categoria", no_expenses_recorded: "Sem despesas registradas",
    create_invoice: "Criar Fatura", new_invoice: "Nova Fatura", services: "Serviços",
    total: "Total", status: "Status", no_invoices_yet: "Sem faturas",
    mark_sent: "Marcar Enviada", mark_paid: "Marcar Paga", add_client: "Adicionar Cliente",
    edit_client: "Editar Cliente", new_client: "Novo Cliente", name: "Nome", phone: "Telefone",
    notes: "Notas", new_appointment: "Novo Agendamento", edit_appointment: "Editar Agendamento",
    barber: "Barbeiro", date_time: "Data e Hora", pending: "Pendente", completed: "Concluído",
    cancelled: "Cancelado", no_appointments: "Sem agendamentos",
    add_barber: "Adicionar Barbeiro", create_barber_account: "Criar Conta de Barbeiro",
    full_name: "Nome Completo", email: "E-mail", password: "Senha",
    commission_rate: "Taxa de Comissão", create_barber: "Criar Barbeiro",
    edit_profile: "Editar Perfil", update_profile: "Atualizar Perfil",
    member: "Membro", role: "Função", total_commission: "Comissão Ganha",
    assign_role: "Atribuir Função", no_team_members: "Sem membros da equipe",
    top_performer: "Melhor Desempenho", performer: "Desempenho", appts: "Agend.",
    save_all_settings: "Salvar Configurações", saving: "Salvando...",
    my_profile: "Meu Perfil", manage_personal_info: "Gerencie suas informações pessoais",
    business_information: "Informações do Negócio", your_salon_details: "Detalhes do salão",
    business_name: "Nome do Negócio", business_phone: "Telefone do Negócio",
    business_email: "E-mail do Negócio", address: "Endereço",
    language_currency: "Idioma e Moeda", regional_preferences: "Preferências regionais",
    language: "Idioma", currency: "Moeda",
    dashboard_sections: "Seções do Painel", toggle_sections: "Ativar ou desativar seções visíveis no menu",
    show_in_nav: "Mostrar {section} na navegação", profile_updated: "Perfil atualizado",
    settings_saved: "Configurações salvas", save_profile: "Salvar Perfil",
    admin: "Admin", user: "Usuário", select_service: "Selecionar serviço",
    select_client: "Selecionar cliente", select_barber: "Selecionar barbeiro",
    optional: "opcional", creating: "Criando...", no_role: "Sem função",
    delete: "Excluir", edit: "Editar", add_service: "Adicionar Serviço", edit_service: "Editar Serviço",
    service_added: "Serviço adicionado", service_updated: "Serviço atualizado", no_services: "Sem serviços",
    price: "Preço", duration: "Duração", minutes: "min",
  },
};

interface SettingsContextType {
  currencySymbol: string;
  currency: string;
  language: string;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  currencySymbol: "$",
  currency: "USD",
  language: "en",
  t: (key) => key,
  formatCurrency: (amount) => `$${amount.toLocaleString()}`,
  loading: true,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("settings")
      .select("currency, currency_symbol, language")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setCurrency(data.currency);
      setCurrencySymbol(data.currency_symbol);
      setLanguage(data.language);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  const formatCurrency = (amount: number): string => {
    return `${currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <SettingsContext.Provider value={{ currencySymbol, currency, language, t, formatCurrency, loading, refreshSettings: loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
