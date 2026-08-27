<template>
  <view class="page">
    <PageHeader :title="titleText" tone="soft" />
    <scroll-view class="scroll" scroll-y>
      <view class="form-card">
        <input v-model="form.bankId" class="input" placeholder="题库 ID" placeholder-class="ph" />
        <input v-model="form.id" class="input" placeholder="题目 ID" placeholder-class="ph" />
        <input v-model="form.title" class="input" placeholder="题目标题" placeholder-class="ph" />

        <view class="switch-row">
          <view class="switch-chip" :class="{ active: form.type === 'choice' }" @tap="form.type = 'choice'">选择题</view>
          <view class="switch-chip" :class="{ active: form.type === 'qa' }" @tap="form.type = 'qa'">问答题</view>
        </view>

        <view v-if="form.type === 'choice'" class="options">
          <view v-for="(option, index) in form.options" :key="index" class="option-row">
            <input v-model="form.options[index]" class="input" :placeholder="`选项 ${index + 1}`" placeholder-class="ph" />
          </view>
          <input v-model="answerIndexText" class="input" placeholder="正确答案序号，从 0 开始" placeholder-class="ph" />
        </view>

        <view v-else class="qa-box">
          <textarea v-model="form.answerText" class="answer" placeholder="标准答案" />
        </view>

        <textarea v-model="form.analysis" class="answer" placeholder="解析" />
        <input v-model="tagText" class="input" placeholder="标签，逗号分隔" placeholder-class="ph" />
        <input v-model="form.imageUrl" class="input" placeholder="图片链接（可选）" placeholder-class="ph" />

        <view class="actions">
          <view class="btn ghost" @tap="save">保存</view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageHeader from '../../shiguangxu/components/PageHeader.vue'
import { useInterviewStore } from '@/store/interview'
import type { InterviewQuestionType } from '@/store/interviewSeed'

const store = useInterviewStore()
const bankId = ref('')
const questionId = ref('')
const answerIndexText = ref('0')
const tagText = ref('')
const form = reactive({
  id: '',
  bankId: '',
  title: '',
  type: 'choice' as InterviewQuestionType,
  options: ['', '', '', ''],
  answerText: '',
  analysis: '',
  imageUrl: '',
})

const titleText = computed(() => (questionId.value ? '编辑题目' : '新增题目'))

onLoad(async (query = {}) => {
  bankId.value = typeof query.bankId === 'string' ? query.bankId : ''
  questionId.value = typeof query.questionId === 'string' ? query.questionId : ''
  await store.init()
  if (bankId.value) form.bankId = bankId.value
  if (questionId.value) {
    const current = store.questionMap[questionId.value]
    if (current) {
      form.id = current.id
      form.bankId = current.bankId
      form.title = current.title
      form.type = current.type
      form.options = [...current.options, '', '', '', ''].slice(0, 4)
      form.answerText = current.answerText
      form.analysis = current.analysis
      form.imageUrl = current.imageUrl || ''
      answerIndexText.value = typeof current.answerIndex === 'number' ? String(current.answerIndex) : '0'
      tagText.value = current.tags.join(', ')
    }
  }
})

async function save() {
  const payload = {
    id: form.id || `question_${Date.now()}`,
    bankId: form.bankId.trim(),
    title: form.title.trim(),
    type: form.type,
    options: form.options,
    answerText: form.type === 'qa' ? form.answerText.trim() : form.options[Number(answerIndexText.value) || 0] || '',
    answerIndex: form.type === 'choice' ? Number(answerIndexText.value) || 0 : undefined,
    analysis: form.analysis.trim(),
    tags: tagText.value.split(',').map((item) => item.trim()).filter(Boolean),
    imageUrl: form.imageUrl.trim(),
  }
  if (!payload.bankId || !payload.title) {
    uni.showToast({ title: '题库和标题不能为空', icon: 'none' })
    return
  }
  if (form.type === 'choice' && payload.options.some((item) => !item.trim())) {
    uni.showToast({ title: '选择题需要补全选项', icon: 'none' })
    return
  }
  if (questionId.value) {
    await store.updateQuestion(payload)
  } else {
    await store.addQuestion(payload)
  }
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: #f7f4ec; }
.scroll { height: calc(100vh - 88rpx); padding: 0 24rpx 32rpx; box-sizing: border-box; }
.form-card { margin-top: 12rpx; padding: 22rpx; border-radius: 24rpx; background: #fff; box-shadow: 0 10rpx 30rpx rgba(16,35,63,.08); display: grid; gap: 12rpx; }
.input, .answer { width: 100%; min-height: 84rpx; padding: 16rpx; border-radius: 18rpx; background: #f8fafc; box-sizing: border-box; }
.answer { min-height: 160rpx; }
.switch-row, .actions { display: flex; gap: 12rpx; }
.switch-chip, .btn { height: 64rpx; padding: 0 16rpx; border-radius: 18rpx; display: flex; align-items: center; justify-content: center; background: #f3f6fb; color: #314156; font-weight: 700; }
.switch-chip.active { background: #10233f; color: #fff; }
.ghost { background: #10233f; color: #fff; }
</style>
