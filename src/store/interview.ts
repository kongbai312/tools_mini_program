import { defineStore } from 'pinia'
import {
  deleteInterviewQuestion,
  deleteInterviewBank,
  deleteInterviewProgress,
  fetchInterviewBanks,
  fetchInterviewProgress,
  fetchInterviewQuestions,
  saveInterviewBanks,
  saveInterviewProgress,
  saveInterviewQuestion,
  updateInterviewQuestion,
  type InterviewProgressSnapshot,
} from '@/services/interviewCloud'
import {
  interviewBankSeed,
  interviewQuestionSeed,
  type InterviewBankSeed,
  type InterviewQuestionSeed,
  type InterviewQuestionType,
} from './interviewSeed'

export type PracticeMode = 'ordered' | 'random'

export interface InterviewBank extends InterviewBankSeed {
  questionCount: number
  updatedAt?: number
}

export interface InterviewQuestion extends InterviewQuestionSeed {
  attempts: number
  correctCount: number
  wrongCount: number
}

export interface BankDraft {
  id: string
  name: string
  description: string
  color: string
}

export interface QuestionDraft {
  id: string
  bankId: string
  title: string
  type: InterviewQuestionType
  options: string[]
  answerText: string
  answerIndex?: number
  analysis: string
  tags: string[]
  imageUrl?: string
}

const BANK_STORAGE_KEY = 'interview_banks'
const ACTIVE_BANK_STORAGE_KEY = 'interview_active_bank'
const PROGRESS_STORAGE_KEY = 'interview_progress_map'

interface BankProgressState extends InterviewProgressSnapshot {}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = uni.getStorageSync(key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    /* ignore */
  }
  return fallback
}

function saveJson(key: string, value: unknown) {
  uni.setStorageSync(key, JSON.stringify(value))
}

function loadLocalBanks(): InterviewBank[] {
  const banks = loadJson<InterviewBank[]>(BANK_STORAGE_KEY, [])
  return Array.isArray(banks) && banks.length ? banks : interviewBankSeed.map((item) => ({ ...item }))
}

function saveLocalBanks(banks: InterviewBank[]) {
  saveJson(BANK_STORAGE_KEY, banks)
}

function loadLocalActiveBank(): string {
  return typeof uni.getStorageSync(ACTIVE_BANK_STORAGE_KEY) === 'string' ? uni.getStorageSync(ACTIVE_BANK_STORAGE_KEY) : ''
}

function saveLocalActiveBank(bankId: string) {
  uni.setStorageSync(ACTIVE_BANK_STORAGE_KEY, bankId)
}

function loadLocalProgressMap(): Record<string, BankProgressState> {
  return loadJson<Record<string, BankProgressState>>(PROGRESS_STORAGE_KEY, {})
}

function saveLocalProgressMap(progressMap: Record<string, BankProgressState>) {
  saveJson(PROGRESS_STORAGE_KEY, progressMap)
}

function shuffle<T>(items: T[]) {
  const list = [...items]
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

function normalizeAnswer(text: string) {
  return text.replace(/\s+/g, '').toLowerCase()
}

function isQaAnswerCorrect(expected: string, actual: string) {
  const expectedValue = normalizeAnswer(expected)
  const actualValue = normalizeAnswer(actual)
  if (!expectedValue) return actualValue.length > 0
  return actualValue === expectedValue || actualValue.includes(expectedValue) || expectedValue.includes(actualValue)
}

function buildQuestionView(question: InterviewQuestionSeed, progress: BankProgressState): InterviewQuestion {
  return {
    ...question,
    attempts: progress.lastQuestionId === question.id ? 1 : 0,
    correctCount: progress.wrongIds.includes(question.id) ? 0 : 1,
    wrongCount: progress.wrongIds.includes(question.id) ? 1 : 0,
  }
}

function normalizeDraft(question: QuestionDraft): InterviewQuestionSeed {
  return {
    id: question.id,
    bankId: question.bankId,
    sort: Date.now(),
    title: question.title,
    type: question.type,
    options: question.options.filter((item) => item.trim()),
    answerText: question.answerText,
    answerIndex: typeof question.answerIndex === 'number' ? question.answerIndex : undefined,
    analysis: question.analysis,
    tags: question.tags.filter((item) => item.trim()),
    imageUrl: question.imageUrl || undefined,
  }
}

function getSeedQuestionsByBank(bankId: string) {
  return interviewQuestionSeed.filter((item) => item.bankId === bankId)
}

export const useInterviewStore = defineStore('interview', {
  state: () => ({
    banks: [] as InterviewBank[],
    activeBankId: '' as string,
    questions: [] as InterviewQuestion[],
    questionBankMap: {} as Record<string, InterviewQuestion[]>,
    questionMap: {} as Record<string, InterviewQuestion>,
    bankProgressMap: {} as Record<string, BankProgressState>,
    orderedIds: [] as string[],
    currentIndex: 0,
    practiceMode: 'ordered' as PracticeMode,
    selectedQuestionId: '' as string,
    answeredIndex: null as number | null,
    manualAnswer: '' as string,
    feedback: '' as string,
    isCorrect: null as boolean | null,
    wrongIds: [] as string[],
    loading: false,
    syncing: false,
    synced: false,
    lastSyncError: '',
  }),
  getters: {
    activeBank(state): InterviewBank | null {
      return state.banks.find((bank) => bank.id === state.activeBankId) ?? null
    },
    currentQuestion(state): InterviewQuestion | null {
      if (!state.selectedQuestionId) return null
      return state.questionMap[state.selectedQuestionId] ?? null
    },
    currentQuestionIndex(): number {
      return Math.max(this.orderedIds.indexOf(this.selectedQuestionId), 0)
    },
    totalCount(): number {
      return this.questions.length
    },
    wrongQuestions(): InterviewQuestion[] {
      return this.wrongIds
        .map((id) => this.questionMap[id])
        .filter((item): item is InterviewQuestion => Boolean(item))
    },
    masteredCount(): number {
      return Math.max(this.questions.length - this.wrongIds.length, 0)
    },
    progressPercent(): number {
      if (!this.questions.length) return 0
      return Math.round((this.masteredCount / this.questions.length) * 100)
    },
    bankOptions(): { label: string; value: string }[] {
      return this.banks.map((bank) => ({ label: bank.name, value: bank.id }))
    },
  },
  actions: {
    ensureBank(progressMap: Record<string, BankProgressState>) {
      if (!this.activeBankId && this.banks.length) {
        this.activeBankId = this.banks[0].id
      }
      if (this.activeBankId && !progressMap[this.activeBankId]) {
        progressMap[this.activeBankId] = {
          bankId: this.activeBankId,
          wrongIds: [],
          practiceMode: 'ordered',
          lastQuestionId: null,
          updatedAt: 0,
        }
      }
    },
    rebuildIndex() {
      const ordered = this.practiceMode === 'random' ? shuffle(this.questions.map((item) => item.id)) : this.questions.map((item) => item.id)
      this.orderedIds = ordered
      if (!this.selectedQuestionId || !ordered.includes(this.selectedQuestionId)) {
        this.selectedQuestionId = ordered[0] ?? ''
      }
      this.currentIndex = Math.max(ordered.indexOf(this.selectedQuestionId), 0)
    },
    applyQuestions(seed: InterviewQuestionSeed[], progress: BankProgressState) {
      this.questions = seed.map((question) => buildQuestionView(question, progress))
      this.questionMap = this.questions.reduce<Record<string, InterviewQuestion>>((acc, item) => {
        acc[item.id] = item
        return acc
      }, {})
      if (progress.bankId) {
        this.questionBankMap[progress.bankId] = this.questions
      }
      this.practiceMode = progress.practiceMode
      this.wrongIds = progress.wrongIds.filter((id) => Boolean(this.questionMap[id]))
      this.selectedQuestionId = progress.lastQuestionId && this.questionMap[progress.lastQuestionId] ? progress.lastQuestionId : this.questions[0]?.id ?? ''
      this.answeredIndex = null
      this.manualAnswer = ''
      this.feedback = ''
      this.isCorrect = null
      this.rebuildIndex()
    },
    loadBankProgress(bankId: string): BankProgressState {
      return this.bankProgressMap[bankId] ?? {
        bankId,
        wrongIds: [],
        practiceMode: 'ordered',
        lastQuestionId: null,
        updatedAt: 0,
      }
    },
    persistCurrentProgress() {
      if (!this.activeBankId) return
      const payload: BankProgressState = {
        bankId: this.activeBankId,
        wrongIds: [...this.wrongIds],
        practiceMode: this.practiceMode,
        lastQuestionId: this.selectedQuestionId || null,
        updatedAt: Date.now(),
      }
      this.bankProgressMap[this.activeBankId] = payload
      saveLocalProgressMap(this.bankProgressMap)
      void this.syncProgress(payload)
    },
    async loadQuestionsForBank(bankId: string) {
      if (this.questionBankMap[bankId]) {
        return this.questionBankMap[bankId]
      }
      const cloudQuestions = await fetchInterviewQuestions(bankId)
      const bankQuestions = cloudQuestions?.length ? cloudQuestions : getSeedQuestionsByBank(bankId)
      const progress = this.loadBankProgress(bankId)
      const list = bankQuestions.map((question) => buildQuestionView(question, progress))
      this.questionBankMap[bankId] = list
      return list
    },
    async syncProgress(payload: BankProgressState) {
      if (this.syncing) return false
      this.syncing = true
      this.lastSyncError = ''
      try {
        const ok = await saveInterviewProgress(payload)
        this.synced = ok
        if (!ok) this.lastSyncError = '云端同步失败'
        return ok
      } catch (error) {
        this.lastSyncError = error instanceof Error ? error.message : '云端同步失败'
        return false
      } finally {
        this.syncing = false
      }
    },
    async init() {
      this.loading = true
      this.lastSyncError = ''
      try {
        const cloudBanks = await fetchInterviewBanks()
        const hasCloudBanks = Boolean(cloudBanks && cloudBanks.length)
        if (hasCloudBanks) {
          this.banks = cloudBanks as InterviewBank[]
        } else {
          this.banks = interviewBankSeed.map((item) => ({ ...item }))
          void saveInterviewBanks(interviewBankSeed)
        }

        const savedActiveBank = loadLocalActiveBank()
        this.activeBankId = this.banks.find((bank) => bank.id === savedActiveBank)?.id || this.banks[0]?.id || ''
        saveLocalActiveBank(this.activeBankId)

        this.bankProgressMap = loadLocalProgressMap()
        const cloudProgress = this.activeBankId ? await fetchInterviewProgress(this.activeBankId) : null
        if (cloudProgress) {
          this.bankProgressMap[this.activeBankId] = cloudProgress
        }

        const cloudQuestions = this.activeBankId ? await fetchInterviewQuestions(this.activeBankId) : null
        const seedQuestions = interviewQuestionSeed.filter((item) => item.bankId === this.activeBankId)
        if (cloudQuestions && cloudQuestions.length === 0 && seedQuestions.length) {
          void Promise.all(seedQuestions.map((item) => saveInterviewQuestion(item)))
        }

        const activeQuestions = cloudQuestions?.length ? cloudQuestions : seedQuestions
        const progress = this.loadBankProgress(this.activeBankId)
        this.applyQuestions(activeQuestions, progress)

        saveLocalBanks(this.banks)
        saveLocalProgressMap(this.bankProgressMap)
      } catch (error) {
        this.lastSyncError = error instanceof Error ? error.message : '题库加载失败'
        this.banks = loadLocalBanks()
        this.activeBankId = this.banks[0]?.id || ''
        saveLocalActiveBank(this.activeBankId)
        this.bankProgressMap = loadLocalProgressMap()
        const activeQuestions = interviewQuestionSeed.filter((item) => item.bankId === this.activeBankId)
        const progress = this.loadBankProgress(this.activeBankId)
        this.applyQuestions(activeQuestions, progress)
      } finally {
        this.loading = false
      }
    },
    async setActiveBank(bankId: string) {
      if (!this.banks.find((bank) => bank.id === bankId)) return
      this.activeBankId = bankId
      saveLocalActiveBank(bankId)
      const cloudProgress = await fetchInterviewProgress(bankId)
      if (cloudProgress) {
        this.bankProgressMap[bankId] = cloudProgress
      }
      const bankQuestions = await this.loadQuestionsForBank(bankId)
      const progress = this.loadBankProgress(bankId)
      this.applyQuestions(bankQuestions, progress)
    },
    setPracticeMode(mode: PracticeMode) {
      this.practiceMode = mode
      this.rebuildIndex()
      this.persistCurrentProgress()
    },
    pickQuestion(id: string) {
      if (!this.questionMap[id]) return
      this.selectedQuestionId = id
      this.answeredIndex = null
      this.manualAnswer = ''
      this.feedback = ''
      this.isCorrect = null
      this.currentIndex = Math.max(this.orderedIds.indexOf(id), 0)
      this.persistCurrentProgress()
    },
    nextQuestion() {
      if (!this.orderedIds.length) return
      const nextIndex = (this.currentIndex + 1) % this.orderedIds.length
      this.pickQuestion(this.orderedIds[nextIndex])
    },
    prevQuestion() {
      if (!this.orderedIds.length) return
      const prevIndex = (this.currentIndex - 1 + this.orderedIds.length) % this.orderedIds.length
      this.pickQuestion(this.orderedIds[prevIndex])
    },
    submitAnswer(optionIndex?: number) {
      const current = this.currentQuestion
      if (!current) return false
      const correct = current.type === 'choice'
        ? optionIndex === current.answerIndex
        : isQaAnswerCorrect(current.answerText, this.manualAnswer)
      this.answeredIndex = typeof optionIndex === 'number' ? optionIndex : this.answeredIndex
      this.isCorrect = correct
      this.feedback = correct ? '答对了，继续下一题。' : `正确答案：${current.answerText}`
      const question = this.questionMap[current.id]
      if (question) {
        question.attempts += 1
        if (correct) {
          question.correctCount += 1
          this.wrongIds = this.wrongIds.filter((id) => id !== current.id)
        } else {
          question.wrongCount += 1
          if (!this.wrongIds.includes(current.id)) this.wrongIds.unshift(current.id)
        }
      }
      this.persistCurrentProgress()
      return correct
    },
    setManualAnswer(value: string) {
      this.manualAnswer = value
    },
    removeFromWrongBook(questionId: string) {
      this.wrongIds = this.wrongIds.filter((id) => id !== questionId)
      this.persistCurrentProgress()
    },
    async createBank(draft: BankDraft) {
      const bank: InterviewBank = {
        id: draft.id,
        name: draft.name,
        description: draft.description,
        color: draft.color,
        questionCount: 0,
      }
      this.banks = [bank, ...this.banks.filter((item) => item.id !== bank.id)]
      this.activeBankId = bank.id
      this.bankProgressMap[bank.id] = this.loadBankProgress(bank.id)
      this.questions = []
      this.questionMap = {}
      this.questionBankMap[bank.id] = []
      saveLocalBanks(this.banks)
      saveLocalActiveBank(bank.id)
      saveLocalProgressMap(this.bankProgressMap)
      await saveInterviewBanks(this.banks)
      this.ensureBank(this.bankProgressMap)
      return bank
    },
    async deleteBank(bankId: string) {
      const questions = await this.loadQuestionsForBank(bankId)
      await Promise.all(questions.map((item) => deleteInterviewQuestion(item.id)))
      await Promise.all([
        deleteInterviewBank(bankId),
        deleteInterviewProgress(bankId),
      ])
      this.banks = this.banks.filter((bank) => bank.id !== bankId)
      if (this.activeBankId === bankId) {
        this.activeBankId = this.banks[0]?.id || ''
      }
      delete this.bankProgressMap[bankId]
      delete this.questionBankMap[bankId]
      saveLocalBanks(this.banks)
      saveLocalProgressMap(this.bankProgressMap)
      saveLocalActiveBank(this.activeBankId)
      if (this.activeBankId) {
        await this.setActiveBank(this.activeBankId)
      } else {
        this.questions = []
        this.questionMap = {}
        this.orderedIds = []
        this.selectedQuestionId = ''
      }
    },
    async addQuestion(draft: QuestionDraft) {
      const question = normalizeDraft(draft)
      const view = buildQuestionView(question, this.loadBankProgress(draft.bankId))
      this.questions = [...this.questions, view]
      this.questionMap[question.id] = view
      this.questionBankMap[draft.bankId] = [...(this.questionBankMap[draft.bankId] || []), view]
      const bank = this.banks.find((item) => item.id === draft.bankId)
      if (bank) bank.questionCount += 1
      await saveInterviewQuestion(question)
      await saveInterviewBanks(this.banks)
      saveLocalBanks(this.banks)
      this.rebuildIndex()
    },
    async updateQuestion(draft: QuestionDraft) {
      const previous = this.questionMap[draft.id]
      if (!previous) return this.addQuestion(draft)
      const question = normalizeDraft(draft)
      const view = buildQuestionView(question, this.loadBankProgress(draft.bankId))
      this.questions = this.questions.map((item) => (item.id === draft.id ? view : item))
      this.questionMap[draft.id] = view
      this.questionBankMap[draft.bankId] = (this.questionBankMap[draft.bankId] || []).map((item) => (item.id === draft.id ? view : item))
      if (previous.bankId !== draft.bankId) {
        this.questionBankMap[previous.bankId] = (this.questionBankMap[previous.bankId] || []).filter((item) => item.id !== draft.id)
      }
      await updateInterviewQuestion(question)
      saveLocalBanks(this.banks)
      this.rebuildIndex()
    },
    async deleteQuestion(questionId: string) {
      const question = this.questionMap[questionId]
      if (!question) return
      this.questions = this.questions.filter((item) => item.id !== questionId)
      delete this.questionMap[questionId]
      this.questionBankMap[question.bankId] = (this.questionBankMap[question.bankId] || []).filter((item) => item.id !== questionId)
      this.wrongIds = this.wrongIds.filter((id) => id !== questionId)
      const bank = this.banks.find((item) => item.id === question.bankId)
      if (bank) bank.questionCount = Math.max(bank.questionCount - 1, 0)
      await deleteInterviewQuestion(questionId)
      await saveInterviewBanks(this.banks)
      saveLocalBanks(this.banks)
      this.persistCurrentProgress()
      this.rebuildIndex()
    },
  },
})
