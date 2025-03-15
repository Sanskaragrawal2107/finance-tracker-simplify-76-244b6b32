
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { Invoice, MaterialItem, BankDetails } from '@/lib/types';

const SUPABASE_URL = "https://bpyzpnioddmzniuikbsn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJweXpwbmlvZGRtem5pdWlrYnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODE0MzksImV4cCI6MjA1NzM1NzQzOX0.UEdE77tebNbCdJkmX0RyNpKVp3mWhTL-hekMVNcPuIg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Helper function to fetch site invoices from the database
export const fetchSiteInvoices = async (siteId: string): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase
      .from('site_invoices')
      .select('*')
      .eq('site_id', siteId);
      
    if (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Map Supabase data to Invoice type
    return data.map(invoice => ({
      id: invoice.id,
      date: new Date(invoice.date),
      partyId: invoice.party_id,
      partyName: invoice.party_name,
      material: invoice.material,
      quantity: Number(invoice.quantity || 0),
      rate: Number(invoice.rate || 0),
      gstPercentage: Number(invoice.gst_percentage || 0),
      grossAmount: Number(invoice.gross_amount || 0),
      netAmount: Number(invoice.net_amount || 0),
      materialItems: invoice.material_items ? (Array.isArray(invoice.material_items) ? 
        invoice.material_items as MaterialItem[] : 
        JSON.parse(invoice.material_items as string) as MaterialItem[]
      ) : [],
      bankDetails: invoice.bank_details ? (
        typeof invoice.bank_details === 'string' ? 
          JSON.parse(invoice.bank_details) as BankDetails : 
          invoice.bank_details as BankDetails
      ) : {
        accountNumber: '',
        bankName: '',
        ifscCode: ''
      },
      billUrl: invoice.bill_url,
      invoiceImageUrl: invoice.bill_url, // For compatibility
      paymentStatus: invoice.payment_status as any,
      createdBy: invoice.created_by || '',
      createdAt: new Date(invoice.created_at),
      approverType: invoice.approver_type as any || 'supervisor',
      siteId: invoice.site_id
    }));
  } catch (error) {
    console.error('Error in fetchSiteInvoices:', error);
    return [];
  }
};
