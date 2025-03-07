
import React, { useState } from 'react';
import PageTitle from '@/components/common/PageTitle';
import CustomCard from '@/components/ui/CustomCard';
import { Search, Filter, Plus, FileText, Upload, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Expense, ExpenseCategory, ApprovalStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import { toast } from 'sonner';

// Mock data for demonstration
const initialExpenses: Expense[] = [
  {
    id: '1',
    date: new Date('2023-07-05'),
    description: 'Purchase of cement',
    category: ExpenseCategory.MATERIAL,
    amount: 25000,
    status: ApprovalStatus.APPROVED,
    createdBy: 'Supervisor',
    createdAt: new Date('2023-07-05'),
  },
  {
    id: '2',
    date: new Date('2023-07-04'),
    description: 'Labor wages',
    category: ExpenseCategory.LABOR,
    amount: 35000,
    status: ApprovalStatus.APPROVED,
    createdBy: 'Admin',
    createdAt: new Date('2023-07-04'),
  },
  {
    id: '3',
    date: new Date('2023-07-03'),
    description: 'Auto fare for site visit',
    category: ExpenseCategory.TRAVEL,
    amount: 500,
    status: ApprovalStatus.APPROVED,
    createdBy: 'Supervisor',
    createdAt: new Date('2023-07-03'),
  },
  {
    id: '4',
    date: new Date('2023-07-02'),
    description: 'Office supplies',
    category: ExpenseCategory.OFFICE,
    amount: 2500,
    status: ApprovalStatus.APPROVED,
    createdBy: 'Admin',
    createdAt: new Date('2023-07-02'),
  },
  {
    id: '5',
    date: new Date('2023-07-01'),
    description: 'Equipment rental',
    category: ExpenseCategory.EQUIPMENT,
    amount: 15000,
    status: ApprovalStatus.PENDING,
    createdBy: 'Supervisor',
    createdAt: new Date('2023-07-01'),
  },
  {
    id: '6',
    date: new Date('2023-06-30'),
    description: 'Transport of materials',
    category: ExpenseCategory.TRANSPORT,
    amount: 12000,
    status: ApprovalStatus.PENDING,
    createdBy: 'Supervisor',
    createdAt: new Date('2023-06-30'),
  },
  {
    id: '7',
    date: new Date('2023-06-29'),
    description: 'Accommodation for workers',
    category: ExpenseCategory.ACCOMMODATION,
    amount: 18000,
    status: ApprovalStatus.REJECTED,
    createdBy: 'Supervisor',
    createdAt: new Date('2023-06-29'),
  },
];

const getCategoryColor = (category: ExpenseCategory | string) => {
  switch (category) {
    case ExpenseCategory.MATERIAL:
      return 'bg-blue-100 text-blue-800';
    case ExpenseCategory.LABOR:
      return 'bg-green-100 text-green-800';
    case ExpenseCategory.TRAVEL:
      return 'bg-yellow-100 text-yellow-800';
    case ExpenseCategory.OFFICE:
      return 'bg-purple-100 text-purple-800';
    case ExpenseCategory.MISC:
      return 'bg-gray-100 text-gray-800';
    case ExpenseCategory.TRANSPORT:
      return 'bg-orange-100 text-orange-800';
    case ExpenseCategory.FOOD:
      return 'bg-red-100 text-red-800';
    case ExpenseCategory.ACCOMMODATION:
      return 'bg-pink-100 text-pink-800';
    case ExpenseCategory.EQUIPMENT:
      return 'bg-indigo-100 text-indigo-800';
    case ExpenseCategory.MAINTENANCE:
      return 'bg-teal-100 text-teal-800';
    // Custom categories for the new system
    case "STAFF TRAVELLING CHARGES":
      return 'bg-yellow-100 text-yellow-800';
    case "STATIONARY & PRINTING":
      return 'bg-purple-100 text-purple-800';
    case "DIESEL & FUEL CHARGES":
      return 'bg-orange-100 text-orange-800';
    case "LABOUR TRAVELLING EXP.":
      return 'bg-yellow-100 text-yellow-800';
    case "LOADGING & BOARDING FOR STAFF":
      return 'bg-pink-100 text-pink-800';
    case "FOOD CHARGES FOR LABOUR":
      return 'bg-red-100 text-red-800';
    case "SITE EXPENSES":
      return 'bg-gray-100 text-gray-800';
    case "ROOM RENT FOR LABOUR":
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: ApprovalStatus) => {
  switch (status) {
    case ApprovalStatus.APPROVED:
      return 'bg-green-100 text-green-800';
    case ApprovalStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case ApprovalStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddExpense = (newExpense: Partial<Expense>) => {
    const expenseWithId: Expense = {
      ...newExpense as Expense,
      id: (expenses.length + 1).toString(),
      status: ApprovalStatus.PENDING,
      createdAt: new Date(),
    };
    
    setExpenses([expenseWithId, ...expenses]);
    toast.success("Expense added successfully");
  };

  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <PageTitle 
        title="Expenses" 
        subtitle="Track and manage your daily expenditures"
      />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search expenses..." 
            className="py-2 pl-10 pr-4 border rounded-md w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-10">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-10">
            <Upload className="h-4 w-4 mr-2 text-muted-foreground" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="h-10">
            <Download className="h-4 w-4 mr-2 text-muted-foreground" />
            Export
          </Button>
          <Button 
            size="sm" 
            className="h-10"
            onClick={() => setIsExpenseFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Expense
          </Button>
        </div>
      </div>
      
      <CustomCard>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pl-4 font-medium text-muted-foreground">Date</th>
                <th className="pb-3 font-medium text-muted-foreground">Description</th>
                <th className="pb-3 font-medium text-muted-foreground">Category</th>
                <th className="pb-3 font-medium text-muted-foreground">Amount</th>
                <th className="pb-3 font-medium text-muted-foreground">Status</th>
                <th className="pb-3 font-medium text-muted-foreground">Created By</th>
                <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-4 pl-4 text-sm">{format(expense.date, 'MMM dd, yyyy')}</td>
                  <td className="py-4 text-sm">{expense.description}</td>
                  <td className="py-4 text-sm">
                    <span className={`${getCategoryColor(expense.category)} px-2 py-1 rounded-full text-xs font-medium`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-4 text-sm font-medium">₹{expense.amount.toLocaleString()}</td>
                  <td className="py-4 text-sm">
                    <span className={`${getStatusColor(expense.status)} px-2 py-1 rounded-full text-xs font-medium`}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm">{expense.createdBy}</td>
                  <td className="py-4 pr-4 text-right">
                    <button className="p-1 rounded-md hover:bg-muted transition-colors">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between mt-4 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing 1-{filteredExpenses.length} of {filteredExpenses.length} entries
          </p>
          <div className="flex items-center space-x-2">
            <button className="p-1 rounded-md hover:bg-muted transition-colors" disabled>
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-sm">1</button>
            <button className="p-1 rounded-md hover:bg-muted transition-colors" disabled>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </CustomCard>

      {/* Expense Form Dialog */}
      <ExpenseForm
        isOpen={isExpenseFormOpen}
        onClose={() => setIsExpenseFormOpen(false)}
        onSubmit={handleAddExpense}
      />
    </div>
  );
};

export default Expenses;
