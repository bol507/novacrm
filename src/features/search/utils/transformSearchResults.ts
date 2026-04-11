import type { SearchResultsByModule, SearchResultItem } from '../types/search.types';

/**
 * Transform raw backend search results to frontend SearchResultItem format
 * 
 * Backend returns Vtiger-native field names; frontend expects normalized format.
 * This function bridges the gap without requiring backend changes.
 */
export const transformSearchResults = (
  rawResults: Record<string, any[]> | null | undefined
): SearchResultsByModule => {
  if (!rawResults) {
    return {
      projects: [],
      clients: [],
      opportunities: [],
      quotes: [],
      tasks: [],
      contacts: [],
    };

   
  };
   return {
    projects: transformProjects(rawResults.projects ?? []),
    clients: transformClients(rawResults.clients ?? []),
    opportunities: transformOpportunities(rawResults.opportunities ?? []),
    quotes: transformQuotes(rawResults.quotes ?? []),
    tasks: transformTasks(rawResults.tasks ?? []),
    contacts: transformContacts(rawResults.contacts ?? []),
   };
};

/**
 * Transform Vtiger Project results to SearchResultItem format
 */
const transformProjects = (projects: any[]): SearchResultItem[] => {
  return projects.map((p) => ({
    id: p.projectid,
    type: 'project',
    title: p.projectname,
    number: p.project_no,
    client: p.accountname,
    status: p.projectstatus,
    url: `/dashboard/projects/${p.projectid}`,
  }));
};

/**
 * Transform Vtiger Account (Client) results to SearchResultItem format
 */
const transformClients = (clients: any[]): SearchResultItem[] => {
  return clients.map((c) => ({
    id: c.accountid,
    type: 'client',
    title: c.accountname,
    number: c.account_no,
    email: c.email1,
    phone: c.phone,
    description: c.description,
    url: `/dashboard/clients/${c.accountid}`,
  }));
};

/**
 * Transform Vtiger Potential (Opportunity) results to SearchResultItem format
 */
const transformOpportunities = (opportunities: any[]): SearchResultItem[] => {
  return opportunities.map((o) => ({
    id: o.potentialid,
    type: 'opportunity',
    title: o.potentialname,
    number: o.potential_no,
    client: o.related_to_name,
    status: o.sales_stage,
    amount: o.amount ? parseFloat(o.amount).toFixed(2) : undefined,
    url: `/dashboard/opportunities/${o.potentialid}`,
  }));
};

/**
 * Transform Vtiger Quote results to SearchResultItem format
 */
const transformQuotes = (quotes: any[]): SearchResultItem[] => {
  return quotes.map((q) => ({
    id: q.quoteid,
    type: 'quote',
    title: q.subject,
    number: q.quote_no,
    client: q.accountname,
    status: q.quotestage,
    total: q.total ? parseFloat(q.total).toFixed(2) : undefined,
    url: `/dashboard/quotes/${q.quoteid}`,
  }));
};

/**
 * Transform Vtiger Task results to SearchResultItem format
 * (Tasks already have correct format, just ensure type is set)
 */
const transformTasks = (tasks: any[]): SearchResultItem[] => {
  return tasks.map((t) => ({
    id: t.id,
    type: 'task',
    title: t.title ?? t.subject ?? '',
    description: t.description,
    due_date: t.due_date,
    status: t.status,
    url: t.url ?? `/dashboard/tasks/${t.id}`,
  }));
};

/**
 * Transform Vtiger Contact results to SearchResultItem format
 */
const transformContacts = (contacts: any[]): SearchResultItem[] => {
  return contacts.map((c) => ({
    id: c.contactid,
    type: 'contact',
    title: `${c.firstname ?? ''} ${c.lastname ?? ''}`.trim(),
    email: c.email,
    phone: c.phone,
    company: c.accountname,
    url: `/dashboard/contacts/${c.contactid}`,
  }));
};