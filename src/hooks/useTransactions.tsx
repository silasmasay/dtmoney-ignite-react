import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { api } from './../services/api';

interface Transaction {
  id: number;
  title: string;
  category: string;
  amount: number;
  createAt: string;
  type: string;
}

type TransactionInput = Omit<Transaction, 'id' | 'createAt'>

type TransactionApi = Omit<Transaction, 'id'>

interface TransactionApiProps {
  data: {
    transaction: Transaction;
  }
}

interface TransactionsProviderProps {
  children: ReactNode;
}

interface TransactionsContextData {
  transactions: Transaction[];
  createTransaction: (transaction: TransactionInput) => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextData>(
  {} as TransactionsContextData
);

export function TransactionsProvider({ children }: TransactionsProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    api.get<TransactionsContextData>('transactions')
      .then((response) => setTransactions(response.data.transactions));
  }, []);

  async function createTransaction(TransactionInput: TransactionInput) {
    const response = await api.post<TransactionApi, TransactionApiProps>('transactions', {
      ...TransactionInput,
      createAt: new Date().toString()
    });

    const { transaction } = response.data;

    setTransactions([
      ...transactions,
      transaction
    ]);
  }

  return (
    <TransactionsContext.Provider value={{ transactions, createTransaction }}>
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionsContext);

  return context;
}