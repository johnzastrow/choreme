import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import type {
  LedgerEntry,
  TransferRequest,
  SpendingLimit,
  DepositRequest,
  WithdrawalRequest,
  CreateTransferRequest,
  SpendingCheckResult,
} from '@/types'

export const useAccountStore = defineStore('account', () => {
  const ledgerEntries = ref<LedgerEntry[]>([])
  const balance = ref<string>('0.00')
  const transfers = ref<TransferRequest[]>([])
  const pendingTransfers = ref<TransferRequest[]>([])
  const spendingLimits = ref<SpendingLimit | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLedgerEntries(userId?: number) {
    try {
      loading.value = true
      error.value = null
      ledgerEntries.value = await api.getLedgerEntries(userId)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch ledger'
    } finally {
      loading.value = false
    }
  }

  async function fetchBalance(userId?: number) {
    try {
      balance.value = await api.getUserBalance(userId)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch balance'
    }
  }

  async function deposit(data: DepositRequest) {
    try {
      loading.value = true
      error.value = null
      await api.deposit(data)
      await fetchLedgerEntries(data.user_id)
      await fetchBalance(data.user_id)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Deposit failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function withdraw(data: WithdrawalRequest) {
    try {
      loading.value = true
      error.value = null
      await api.withdraw(data)
      await fetchLedgerEntries()
      await fetchBalance()
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Withdrawal failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function checkSpendingLimit(amount: string): Promise<SpendingCheckResult | null> {
    try {
      return await api.checkSpendingLimit(amount)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to check limit'
      return null
    }
  }

  async function createTransfer(data: CreateTransferRequest) {
    try {
      loading.value = true
      error.value = null
      const transfer = await api.createTransfer(data)
      transfers.value.unshift(transfer)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Transfer request failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchTransfers() {
    try {
      loading.value = true
      error.value = null
      transfers.value = await api.getTransfers()
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch transfers'
    } finally {
      loading.value = false
    }
  }

  async function fetchPendingTransfers() {
    try {
      loading.value = true
      error.value = null
      pendingTransfers.value = await api.getPendingTransfers()
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch pending transfers'
    } finally {
      loading.value = false
    }
  }

  async function approveTransfer(transferId: number, approved: boolean, reason?: string) {
    try {
      loading.value = true
      error.value = null
      await api.approveTransfer(transferId, approved, reason)
      await fetchPendingTransfers()
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Transfer approval failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchSpendingLimits(userId: number) {
    try {
      loading.value = true
      error.value = null
      spendingLimits.value = await api.getSpendingLimits(userId)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch spending limits'
    } finally {
      loading.value = false
    }
  }

  async function setSpendingLimits(userId: number, daily?: string, weekly?: string, monthly?: string) {
    try {
      loading.value = true
      error.value = null
      await api.setSpendingLimits({
        user_id: userId,
        daily_limit: daily,
        weekly_limit: weekly,
        monthly_limit: monthly,
      })
      await fetchSpendingLimits(userId)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to set spending limits'
      return false
    } finally {
      loading.value = false
    }
  }

  async function resetSpendingLimits(userId: number) {
    try {
      loading.value = true
      error.value = null
      await api.resetSpendingLimits(userId)
      await fetchSpendingLimits(userId)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to reset spending limits'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    ledgerEntries,
    balance,
    transfers,
    pendingTransfers,
    spendingLimits,
    loading,
    error,
    fetchLedgerEntries,
    fetchBalance,
    deposit,
    withdraw,
    checkSpendingLimit,
    createTransfer,
    fetchTransfers,
    fetchPendingTransfers,
    approveTransfer,
    fetchSpendingLimits,
    setSpendingLimits,
    resetSpendingLimits,
  }
})
