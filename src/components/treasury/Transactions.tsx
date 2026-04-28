import { useState, useMemo } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useTransactions, useTransactionsByAccount } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { Transaction, TransactionType, Account } from '@/types/treasury';
import { formatAmount, formatDate } from '@/types';
import { updateFraudReview } from '@/api/treasury.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

type TransactionWithAccount = Transaction & {
  account?:        Account;
  fraud_score?:    number | null;
  is_fraud?:       boolean;
  fraud_blocked?:  boolean;
  fraud_reviewed?: boolean;
};

// ─── Type config ──────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  TransactionType,
  { label: string; classes: string; icon: JSX.Element; amountClass: string; sign: string }
> = {
  ENCAISSEMENT: {
    label:       'Encaissement',
    classes:     'bg-green-100 text-green-700',
    icon:        <ArrowDownCircle className="h-3.5 w-3.5" />,
    amountClass: 'text-green-600 font-semibold',
    sign:        '+',
  },
  DECAISSEMENT: {
    label:       'Décaissement',
    classes:     'bg-red-100 text-red-700',
    icon:        <ArrowUpCircle className="h-3.5 w-3.5" />,
    amountClass: 'text-red-600 font-semibold',
    sign:        '-',
  },
  VIREMENT_INTERNE: {
    label:       'Virement interne',
    classes:     'bg-blue-100 text-blue-700',
    icon:        <ArrowLeftRight className="h-3.5 w-3.5" />,
    amountClass: 'text-blue-600 font-semibold',
    sign:        '',
  },
};

const PAGE_SIZE = 20;

// ─── Fraud badge ──────────────────────────────────────────────────────────
function FraudBadge({ 
  score, 
  reviewed, 
  onClick 
}: { 
  score: number | null | undefined; 
  reviewed?: boolean;
  onClick?: () => void;
}) {
  if (score === null || score === undefined) return null;

  const isClickable = onClick && !reviewed;

  if (score > 0.8)
    return (
      <button
        onClick={onClick}
        disabled={reviewed}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium ${
          isClickable ? 'hover:bg-red-200 cursor-pointer' : 'cursor-default'
        }`}
      >
        <ShieldAlert className="h-3 w-3" />
        {(score * 100).toFixed(0)}% risque
        {reviewed && <CheckCircle className="h-3 w-3 ml-1" />}
      </button>
    );

  if (score > 0.5)
    return (
      <button
        onClick={onClick}
        disabled={reviewed}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium ${
          isClickable ? 'hover:bg-orange-200 cursor-pointer' : 'cursor-default'
        }`}
      >
        <ShieldAlert className="h-3 w-3" />
        {(score * 100).toFixed(0)}% suspect
        {reviewed && <CheckCircle className="h-3 w-3 ml-1" />}
      </button>
    );

  return null;
}

// ─── Summary cards ────────────────────────────────────────────────────────
function SummaryBar({ transactions }: { transactions: TransactionWithAccount[] }) {
  const encaissements = transactions
    .filter((t) => t.type === 'ENCAISSEMENT')
    .reduce((s, t) => s + Number(t.amount), 0);

  const decaissements = transactions
    .filter((t) => t.type === 'DECAISSEMENT')
    .reduce((s, t) => s + Number(t.amount), 0);

  const net = encaissements - decaissements;

  const flagged = transactions.filter(
    (t) => t.fraud_score != null && t.fraud_score > 0.5,
  ).length;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border p-5">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
          <ArrowDownCircle className="h-3 w-3 text-green-500" />
          Total encaissé
        </p>
        <p className="text-2xl font-bold text-green-600">{formatAmount(encaissements)}</p>
      </div>

      <div className="bg-white rounded-xl border p-5">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
          <ArrowUpCircle className="h-3 w-3 text-red-500" />
          Total décaissé
        </p>
        <p className="text-2xl font-bold text-red-600">{formatAmount(decaissements)}</p>
      </div>

      <div className={`rounded-xl border p-5 ${net >= 0 ? 'bg-white' : 'bg-red-50 border-red-200'}`}>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Solde net</p>
        <p className={`text-2xl font-bold ${net >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
          {net >= 0 ? '+' : ''}{formatAmount(net)}
        </p>
      </div>

      <div className={`rounded-xl border p-5 ${flagged > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white'}`}>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
          <ShieldAlert className="h-3 w-3 text-orange-500" />
          Transactions suspectes
        </p>
        <p className={`text-2xl font-bold ${flagged > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
          {flagged}
        </p>
      </div>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────
function TransactionsTable({ 
  transactions,
  onReviewFraud 
}: { 
  transactions: TransactionWithAccount[];
  onReviewFraud: (transaction: TransactionWithAccount) => void;
}) {
  if (transactions.length === 0) {
    return (
      <div className="p-20 text-center">
        <ArrowLeftRight className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Aucune transaction trouvée</p>
        <p className="text-gray-400 text-sm mt-1">
          Modifiez vos filtres ou enregistrez un premier mouvement.
        </p>
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wide">
        <tr>
          <th className="px-4 py-4 text-left">Date</th>
          <th className="px-4 py-4 text-left">Type</th>
          <th className="px-4 py-4 text-left">Description</th>
          <th className="px-4 py-4 text-left">Référence</th>
          <th className="px-4 py-4 text-left">Compte</th>
          <th className="px-4 py-4 text-right">Montant</th>
          <th className="px-4 py-4 text-center">Fraude</th>
          <th className="px-4 py-4 text-center">Rapprochement</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => {
          const cfg       = TYPE_CONFIG[t.type];
          const isFlagged = t.fraud_score != null && t.fraud_score > 0.5;

          return (
            <tr
              key={t.id}
              className={`border-b hover:bg-gray-50 transition-colors ${
                isFlagged ? 'bg-orange-50 hover:bg-orange-100' : ''
              }`}
            >
              <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                {formatDate(t.transaction_date)}
              </td>

              <td className="px-4 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full font-medium ${cfg.classes}`}>
                  {cfg.icon}
                  {cfg.label}
                </span>
              </td>

              <td className="px-4 py-4 text-sm text-gray-700 max-w-[240px] truncate">
                {t.description ?? '—'}
              </td>

              <td className="px-4 py-4 text-sm font-mono text-gray-500">
                {t.reference ?? '—'}
              </td>

              <td className="px-4 py-4 text-sm text-gray-600">
                {t.account?.name ?? '—'}
              </td>

              <td className={`px-4 py-4 text-right text-sm ${cfg.amountClass}`}>
                {cfg.sign}{formatAmount(t.amount)}
              </td>

              <td className="px-4 py-4 text-center">
                <FraudBadge 
                  score={t.fraud_score} 
                  reviewed={t.fraud_reviewed}
                  onClick={isFlagged && !t.fraud_reviewed ? () => onReviewFraud(t) : undefined}
                />
              </td>

              <td className="px-4 py-4 text-center">
                {t.is_reconciled ? (
                  <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                    ✓ Rapproché
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">
                    En attente
                  </span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Fraud Review Modal ───────────────────────────────────────────────────
function FraudReviewModal({
  transaction,
  onClose,
  onConfirm,
}: {
  transaction: TransactionWithAccount | null;
  onClose: () => void;
  onConfirm: (isFraud: boolean) => void;
}) {
  if (!transaction) return null;

  const cfg = TYPE_CONFIG[transaction.type];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Révision de transaction suspecte
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Score de fraude: {((transaction.fraud_score || 0) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date:</span>
            <span className="font-medium">{formatDate(transaction.transaction_date)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Type:</span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full font-medium ${cfg.classes}`}>
              {cfg.icon}
              {cfg.label}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Montant:</span>
            <span className={`font-semibold ${cfg.amountClass}`}>
              {cfg.sign}{formatAmount(transaction.amount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Compte:</span>
            <span className="font-medium">{transaction.account?.name}</span>
          </div>
          {transaction.description && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Description:</span>
              <span className="font-medium text-right">{transaction.description}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Cette transaction a été signalée comme suspecte par le système de détection de fraude.
            Veuillez confirmer s'il s'agit d'une fraude ou d'une transaction légitime.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onConfirm(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <XCircle className="h-4 w-4" />
            C'est une fraude
          </button>
          <button
            onClick={() => onConfirm(false)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <CheckCircle className="h-4 w-4" />
            Transaction légitime
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────
// ─── Main component ───────────────────────────────────────────────────────
export default function Transactions() {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedType, setSelectedType]       = useState('');
  const [fraudOnly, setFraudOnly]             = useState(false);
  const [search, setSearch]                   = useState('');
  const [page, setPage]                       = useState(1);
  const [reviewTransaction, setReviewTransaction] = useState<TransactionWithAccount | null>(null);

  const queryClient = useQueryClient();
  const { accounts } = useAccounts();

  const allQuery     = useTransactions();
  const accountQuery = useTransactionsByAccount(selectedAccount);

  const { data: raw = [], isLoading } = (
    selectedAccount ? accountQuery : allQuery
  ) as { data: TransactionWithAccount[]; isLoading: boolean };

  const reviewMutation = useMutation({
    mutationFn: ({ transactionId, isFraud }: { transactionId: string; isFraud: boolean }) =>
      updateFraudReview(transactionId, isFraud),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success(
        variables.isFraud 
          ? 'Transaction marquée comme frauduleuse' 
          : 'Transaction marquée comme légitime'
      );
      setReviewTransaction(null);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const handleReviewFraud = (transaction: TransactionWithAccount) => {
    setReviewTransaction(transaction);
  };

  const handleConfirmReview = (isFraud: boolean) => {
    if (reviewTransaction) {
      reviewMutation.mutate({
        transactionId: reviewTransaction.id,
        isFraud,
      });
    }
  };

  const filtered = useMemo(() => {
    return raw.filter((t) => {
      if (selectedType && t.type !== selectedType) return false;
      if (fraudOnly && (t.fraud_score == null || t.fraud_score <= 0.5)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.description?.toLowerCase().includes(q) ||
          t.reference?.toLowerCase().includes(q)   ||
          t.account?.name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [raw, selectedType, fraudOnly, search]);

  const totalPages   = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated    = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const flaggedCount = raw.filter((t) => t.fraud_score != null && t.fraud_score > 0.5).length;

  const handleChange =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setter(e.target.value);
      setPage(1);
    };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historique des transactions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tous les mouvements financiers de votre entreprise
        </p>
      </div>

      {/* SUMMARY */}
      {!isLoading && filtered.length > 0 && (
        <SummaryBar transactions={filtered} />
      )}

      {/* FILTERS */}
      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3 items-center">

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher description, référence…"
            value={search}
            onChange={handleChange(setSearch)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedAccount}
          onChange={handleChange(setSelectedAccount)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tous les comptes</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={handleChange(setSelectedType)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tous les types</option>
          <option value="ENCAISSEMENT">Encaissement</option>
          <option value="DECAISSEMENT">Décaissement</option>
          <option value="VIREMENT_INTERNE">Virement interne</option>
        </select>

        {/* Fraud filter toggle */}
        <button
          onClick={() => { setFraudOnly((v) => !v); setPage(1); }}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
            fraudOnly
              ? 'bg-orange-100 border-orange-300 text-orange-700'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          Suspectes seulement
          {flaggedCount > 0 && (
            <span className="bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1">
              {flaggedCount}
            </span>
          )}
        </button>

        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
          {filtered.length} transaction(s)
        </span>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-gray-400">Chargement...</div>
        ) : (
          <>
            <TransactionsTable 
              transactions={paginated}
              onReviewFraud={handleReviewFraud}
            />

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <p className="text-sm text-gray-500">
                  Page {page} sur {totalPages} —{' '}
                  <span className="font-medium">{filtered.length}</span> transaction(s)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border hover:bg-white disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border hover:bg-white disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* FRAUD REVIEW MODAL */}
      <FraudReviewModal
        transaction={reviewTransaction}
        onClose={() => setReviewTransaction(null)}
        onConfirm={handleConfirmReview}
      />

    </div>
  );
}
