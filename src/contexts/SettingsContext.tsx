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
  ar: {
    dashboard: "لوحة التحكم", clients: "العملاء", appointments: "المواعيد",
    income: "الدخل", expenses: "المصاريف", invoices: "الفواتير", team: "الفريق",
    settings: "الإعدادات", my_clients: "عملائي", my_appointments: "مواعيدي",
    my_income: "دخلي", sign_out: "تسجيل الخروج", salon_manager: "مدير الصالون",
    menu: "القائمة", today: "اليوم", total_income: "إجمالي الدخل", total_expenses: "إجمالي المصاريف",
    profit: "الربح", top_barber: "أفضل حلاق", recent_appointments: "المواعيد الأخيرة",
    recent_clients: "العملاء الأخيرون", view_all: "عرض الكل", income_overview: "نظرة عامة على الدخل",
    no_appointments_yet: "لا توجد مواعيد بعد", no_clients_yet: "لا يوجد عملاء بعد",
    record_income: "تسجيل دخل", edit_income: "تعديل الدخل", service: "الخدمة",
    client: "العميل", amount: "المبلغ", date: "التاريخ", description: "الوصف",
    save: "حفظ", update: "تحديث", actions: "الإجراءات", loading: "جارٍ التحميل...",
    no_income_recorded: "لم يتم تسجيل أي دخل بعد", commission: "العمولة",
    my_commission: "عمولتي", add_expense: "إضافة مصروف", edit_expense: "تعديل المصروف",
    category: "الفئة", no_expenses_recorded: "لا توجد مصاريف مسجلة",
    create_invoice: "إنشاء فاتورة", new_invoice: "فاتورة جديدة", services: "الخدمات",
    total: "المجموع", status: "الحالة", no_invoices_yet: "لا توجد فواتير بعد",
    mark_sent: "تحديد كمرسلة", mark_paid: "تحديد كمدفوعة", add_client: "إضافة عميل",
    edit_client: "تعديل العميل", new_client: "عميل جديد", name: "الاسم", phone: "الهاتف",
    notes: "ملاحظات", new_appointment: "موعد جديد", edit_appointment: "تعديل الموعد",
    barber: "حلاق", date_time: "التاريخ والوقت", pending: "قيد الانتظار", completed: "مكتمل",
    cancelled: "ملغى", no_appointments: "لا توجد مواعيد بعد",
    add_barber: "إضافة حلاق", create_barber_account: "إنشاء حساب حلاق",
    full_name: "الاسم الكامل", email: "البريد الإلكتروني", password: "كلمة المرور",
    commission_rate: "نسبة العمولة", create_barber: "إنشاء حلاق",
    edit_profile: "تعديل الملف", update_profile: "تحديث الملف",
    member: "عضو", role: "الدور", total_commission: "العمولة المكتسبة",
    assign_role: "تعيين دور", no_team_members: "لا يوجد أعضاء فريق بعد",
    top_performer: "الأفضل أداءً", performer: "الأداء", appts: "مواعيد",
    save_all_settings: "حفظ الإعدادات", saving: "جارٍ الحفظ...",
    my_profile: "ملفي الشخصي", manage_personal_info: "إدارة معلوماتك الشخصية",
    business_information: "معلومات العمل", your_salon_details: "تفاصيل صالونك",
    business_name: "اسم العمل", business_phone: "هاتف العمل",
    business_email: "بريد العمل", address: "العنوان",
    language_currency: "اللغة والعملة", regional_preferences: "التفضيلات الإقليمية",
    language: "اللغة", currency: "العملة",
    dashboard_sections: "أقسام لوحة التحكم", toggle_sections: "تبديل الأقسام المرئية في القائمة الجانبية",
    show_in_nav: "إظهار {section} في التنقل", profile_updated: "تم تحديث الملف",
    settings_saved: "تم حفظ الإعدادات", save_profile: "حفظ الملف",
    admin: "مدير", user: "مستخدم", select_service: "اختر خدمة",
    select_client: "اختر عميل", select_barber: "اختر حلاق",
    optional: "اختياري", creating: "جارٍ الإنشاء...", no_role: "بدون دور",
    delete: "حذف", edit: "تعديل", add_service: "إضافة خدمة", edit_service: "تعديل الخدمة",
    service_added: "تمت إضافة الخدمة", service_updated: "تم تحديث الخدمة", no_services: "لا توجد خدمات بعد",
    price: "السعر", duration: "المدة", minutes: "د",
    my_own_income: "دخلي الخاص", team_commission: "عمولة الفريق",
    admin_share: "حصة المدير (50%)", barber_name: "الحلاق", all_income: "كل الدخل",
    team_income_total: "دخل الفريق", my_work: "عملي",
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
