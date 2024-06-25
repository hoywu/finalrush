import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import _ from 'lodash';

// 单选、多选、填空、简答、编程
export type QuestionType = 'single' | 'multiple' | 'blank' | 'short_answer' | 'coding';

/* eslint-disable no-useless-escape */
const qNumRegex = /^\d+[\.．)）、]/;
const optionRegex = /(?:^[A-F]|\s[B-F])[\.．:：、\s]/i;
const bracketAny = /[\(（]\s*?([^)].*?)\s*?[\)）]/;
const bracketAnyG = /[\(（]\s*?([^)].*?)\s*?[\)）]/g;
const bracketLetter = /[\(（]\s*?[A-F]{1,6}\s*?[\)）]/i;
const bracketBoolean = /[\(（]\s*?(正确|对|错|[⍻✓✓√☑✗✘x×X✕☓✖]).*?[\)）]/u;
const booleanRegex = /正确|对|错|[⍻✓✓√☑✗✘x×X✕☓✖]/u;
const trueRegex = /正确|对|[⍻✓✓√☑]/u;

export interface Question {
  type: QuestionType;
  title: string;
  imgs?: Array<string>;
  options: Array<string>;
  answer: number | Array<number> | string | Array<string>;
  explain: string;
  doNum: number;
  errNum: number;
}

export const useQuestionStore = defineStore(
  'question',
  () => {
    const filename = ref('');
    const questions = ref([] as Array<Question>);
    const qCount = computed(() => questions.value.length);

    function isEmpty() {
      return qCount.value === 0;
    }

    function isSingle(index: number): boolean {
      return questions.value[index].type === 'single';
    }

    function isMultiple(index: number): boolean {
      return questions.value[index].type === 'multiple';
    }

    function isBlank(index: number): boolean {
      return questions.value[index].type === 'blank';
    }

    function isSAQ(index: number): boolean {
      return questions.value[index].type === 'short_answer';
    }

    function needInput(index: number): boolean {
      return isBlank(index) || isSAQ(index);
    }

    function supportCheck(index: number): boolean {
      // 题型是否支持系统判题
      if (['single', 'multiple', 'blank'].includes(questions.value[index].type)) {
        return true;
      }
      return false;
    }

    function checkAnswer(index: number, userAnswer: any): boolean {
      // 检查答案
      let correct;
      switch (questions.value[index].type) {
        case 'single':
          correct = checkSingle(questions.value[index].answer as number, userAnswer);
          break;
        case 'multiple':
          correct = checkMultiple(questions.value[index].answer as Array<number>, userAnswer);
          break;
        case 'blank':
          correct = checkBlank(questions.value[index].answer as Array<string>, userAnswer);
          break;
        default:
          correct = true; // TODO 简答、编程题为人工判题
          break;
      }
      return correct;
    }

    function plusCorrect(index: number) {
      questions.value[index].doNum++;
    }

    function plusWrong(index: number) {
      questions.value[index].doNum++;
      questions.value[index].errNum++;
    }

    function append(qs: Array<Question>) {
      questions.value.push(...qs);
    }

    function recover(name: string, qs: Array<Question>) {
      filename.value = name;
      questions.value = _.cloneDeep(qs);
    }

    function reset() {
      filename.value = '';
      questions.value = [];
    }

    return {
      filename,
      questions,
      qCount,
      isEmpty,
      isSingle,
      isMultiple,
      isBlank,
      isSAQ,
      needInput,
      supportCheck,
      checkAnswer,
      plusCorrect,
      plusWrong,
      append,
      recover,
      reset,
    };
  },
  {
    persist: true,
  }
);

export function parseAuto(data: string, customFilter: string): Array<Question> {
  // [BETA] 根据标题自动选择解析函数
  const questions = [] as Array<Question>;
  const lines = data.split('\n').filter((line) => line.trim() !== '');
  const regExps = customFilter.split('\n').filter((line) => line.trim() !== '');

  const selectReg = /^.?\s*[\.．)）、]?\s*(判断题)|(\S{0,4}选择题)|(\S选题)/u;
  const blankReg = /^.?\s*[\.．)）、]?\s*填空题/u;
  const saqReg = /^.?\s*[\.．)）、]?\s*简答题/u;
  const doParse = () => {
    if (curData.length === 0) {
      funcs.pop();
      return;
    }
    if (funcs.length === 0) {
      curData = [];
      return;
    }
    questions.push(...funcs.pop()!(curData.join('\n'), ''));
    curData = [];
  };

  const funcs: Array<Function> = [];
  let curData: Array<string> = [];
  for (let line of lines) {
    line = line.trim();
    if (customFilter !== '') {
      // 自定义过滤
      let flag = false;
      for (const regExp of regExps) {
        if (line.search(new RegExp(regExp)) !== -1) {
          flag = true;
          break;
        }
      }
      if (flag) continue;
    }

    if (line.search(selectReg) !== -1) {
      doParse();
      funcs.push(parseSelectQuestion);
    } else if (line.search(blankReg) !== -1) {
      doParse();
      funcs.push(parseBlankQuestion);
    } else if (line.search(saqReg) !== -1) {
      doParse();
      funcs.push(parseSAQ);
    } else {
      curData.push(line);
    }
  }
  doParse();

  return questions;
}

export function parseSAQ(data: string, customFilter: string): Array<Question> {
  // 从文本中解析简答题
  const questions = [] as Array<Question>;
  const lines = data.split('\n').filter((line) => line.trim() !== '');
  const regExps = customFilter.split('\n').filter((line) => line.trim() !== '');

  const done = (q: Question) => {
    if (!q.answer) {
      const i = q.title.indexOf('\n');
      if (i !== -1) {
        q.answer = q.title.slice(i + 1);
        q.title = q.title.slice(0, i);
      }
    }
    questions.push(q);
  };

  const newQ = (): Question => {
    return {
      type: 'short_answer',
      title: '',
      options: [],
      answer: '',
      explain: '',
      doNum: 0,
      errNum: 0,
    };
  };
  let currentQ = newQ();

  for (let line of lines) {
    line = line.trim();
    if (customFilter !== '') {
      // 自定义过滤
      let flag = false;
      for (const regExp of regExps) {
        if (line.search(new RegExp(regExp)) !== -1) {
          flag = true;
          break;
        }
      }
      if (flag) continue;
    }

    if (line.search(/^得分[:：][\d\.\s]+?分?$/u) !== -1) {
      // 过滤得分行
      continue;
    }

    const ansReg = /((^答)|(^答案)|(^我的答案)|(^参考答案))[:：]/u;
    if (line.search(ansReg) !== -1) {
      // 答案行
      currentQ.answer = line.replace(ansReg, '');
    } else if (line.search(qNumRegex) !== -1) {
      // 题号
      if (currentQ.title) {
        done(currentQ); // 完成上一题
        currentQ = newQ();
      }
      currentQ.title = line;
    } else {
      if (currentQ.answer) currentQ.answer += '\n' + line;
      else currentQ.title += '\n' + line;
    }
  }

  if (currentQ.title) {
    // 最后一题
    done(currentQ);
  }

  return questions;
}

export function parseBlankQuestion(data: string, customFilter: string): Array<Question> {
  // 从文本中解析填空题
  const questions = [] as Array<Question>;
  const lines = data.split('\n').filter((line) => line.trim() !== '');
  const regExps = customFilter.split('\n').filter((line) => line.trim() !== '');

  const getAnswersFromTitle = (title: string): Array<string> => {
    const answers = [] as Array<string>;
    const match = title.match(bracketAnyG);
    if (match) {
      answers.push(...match.map((m) => m.match(bracketAny)![1]));
    }
    return answers;
  };
  const removeAnswerFromTitle = (title: string): string => {
    return title.replace(bracketAnyG, '( )');
  };
  const done = (q: Question) => {
    q.answer = getAnswersFromTitle(q.title);
    q.title = removeAnswerFromTitle(q.title);
    questions.push(q);
  };

  const newQ = (): Question => {
    return {
      type: 'blank',
      title: '',
      options: [],
      answer: '',
      explain: '',
      doNum: 0,
      errNum: 0,
    };
  };
  let currentQ = newQ();

  for (let line of lines) {
    line = line.trim();
    if (customFilter !== '') {
      // 自定义过滤
      let flag = false;
      for (const regExp of regExps) {
        if (line.search(new RegExp(regExp)) !== -1) {
          flag = true;
          break;
        }
      }
      if (flag) continue;
    }

    if (line.search(/^得分[:：][\d\.\s]+?分?$/u) !== -1) {
      // 过滤得分行
      continue;
    }
    if (line.search(/(^(答案)?解析[:：])/u) !== -1) {
      // 答案解析行，添加到最新一题的解析
      questions[questions.length - 1].explain = line.replace(/(^(答案)?解析[:：])/u, '');
      continue;
    }

    if (line.search(qNumRegex) !== -1) {
      // 本行开头疑似题号
      if (currentQ.title) {
        // 上一题未结束
        done(currentQ);
        // 开始新题
        currentQ = newQ();
      }
      currentQ.title = line;
    } else {
      currentQ.title += line;
    }
  }

  if (currentQ.title) {
    // 最后一题
    done(currentQ);
  }

  return questions;
}

export function parseSelectQuestion(data: string, customFilter: string): Array<Question> {
  // 从文本中解析选择题
  const questions = [] as Array<Question>;
  const lines = data.split('\n').filter((line) => line.trim() !== '');
  const regExps = customFilter.split('\n').filter((line) => line.trim() !== '');

  interface Answer {
    type: 'letter' | 'boolean';
    answer: number | Array<number>;
    multiple?: boolean;
  }

  const findInlineAnswer = (title: string): Answer | null => {
    const match1 = title.toUpperCase().match(bracketLetter);
    if (match1) {
      const match = match1[0].match(/[A-Z]/g);
      if (match!.length === 1) {
        // 单选
        const answer: number = match![0].charCodeAt(0) - 65;
        return {
          type: 'letter',
          answer: answer,
          multiple: false,
        };
      } else {
        // 多选
        const answer: Array<number> = match!.map((letter) => letter.charCodeAt(0) - 65);
        return {
          type: 'letter',
          answer: answer,
          multiple: true,
        };
      }
    }

    const match2 = title.match(bracketBoolean);
    if (match2) {
      // 判断
      const answer: number = match2[0].search(trueRegex) !== -1 ? 0 : 1;
      return {
        type: 'boolean',
        answer: answer,
      };
    }
    return null;
  };

  const removeAnswerFromTitle = (title: string): string => {
    return title.replace(bracketLetter, '( )').replace(bracketBoolean, '( )');
  };

  const setAnswer = (line: string, currentQuestion: Question, currentOptions: any) => {
    if (line.search(booleanRegex) !== -1) {
      currentQuestion.answer = line.search(trueRegex) !== -1 ? 0 : 1;
      currentQuestion.options = ['正确', '错误'];
    } else {
      const match = line.toUpperCase().match(/[A-Z]/g);
      if (match!.length === 1) {
        // 单选
        currentQuestion.type = 'single';
        currentQuestion.answer = match![0].charCodeAt(0) - 65;
      } else {
        // 多选
        currentQuestion.type = 'multiple';
        currentQuestion.answer = match!.map((letter) => letter.charCodeAt(0) - 65);
      }
      currentQuestion.options = currentOptions;
    }
  };

  let currentQuestion: Question = {
    type: 'single',
    title: '',
    options: [],
    answer: '',
    explain: '',
    doNum: 0,
    errNum: 0,
  };
  let currentOptions = [] as Array<string>;
  for (let line of lines) {
    line = line.trim();

    if (customFilter !== '') {
      // 自定义过滤
      let flag = false;
      for (const regExp of regExps) {
        if (line.search(new RegExp(regExp)) !== -1) {
          flag = true;
          break;
        }
      }
      if (flag) continue;
    }

    if (line.search(/^得分[:：][\d\.\s]+?分?$/u) !== -1) {
      // 过滤得分行
      continue;
    }
    if (line.search(/(^[单多]项选择题$)|(^[单多]选题$)|(^判断题$)|(^全部题目$)/u) !== -1) {
      // 过滤题型行
      continue;
    }

    if (line.search(/(^(答案)?解析[:：])/u) !== -1) {
      // 答案解析行，添加到最新一题的解析
      questions[questions.length - 1].explain = line.replace(/(^(答案)?解析[:：])/u, '');
      continue;
    }

    if (line.search(/(^答案)|(^我的答案)|(^参考答案)/u) !== -1) {
      // 答案行
      if (line.search(/(^参考答案)/u) !== -1 && !currentQuestion.title) {
        // 参考答案行，且上一题已结束，说明可能是上一题的参考答案
        currentQuestion = questions.pop()!;
        currentOptions = currentQuestion.options;
      }
      setAnswer(line, currentQuestion, currentOptions);
      questions.push(currentQuestion);
      currentQuestion = {
        type: 'single',
        title: '',
        options: [],
        answer: '',
        explain: '',
        doNum: 0,
        errNum: 0,
      };
      currentOptions = [];
    } else if (line.search(/(^正确$)|(^错误$)/i) !== -1) {
      // 选项行
      currentQuestion.options = ['正确', '错误'];
    } else if (line.charAt(0).search(/[A-Z]/i) !== -1) {
      // 选项行
      line
        .split(optionRegex)
        .filter((option) => option.trim() !== '')
        .forEach((option) => {
          currentOptions.push(option.trim());
        });
    } else if (line.search(qNumRegex) !== -1) {
      // 本行开头疑似题号
      if (currentQuestion.title) {
        // 上一题未结束，说明可能没有单独的答案行，尝试在题目中找答案
        const find = findInlineAnswer(currentQuestion.title);
        if (find) {
          currentQuestion.title = removeAnswerFromTitle(currentQuestion.title);
          currentQuestion.answer = find.answer;
          currentQuestion.options = find.type === 'letter' ? currentOptions : ['正确', '错误'];
          if (find.multiple) {
            currentQuestion.type = 'multiple';
          }
          questions.push(currentQuestion);
          currentQuestion = {
            type: 'single',
            title: '',
            options: [],
            answer: '',
            explain: '',
            doNum: 0,
            errNum: 0,
          };
          currentOptions = [];

          currentQuestion.title = line;
          continue;
        }

        // 题目中没有找到答案，本行可能是题目的一部分
        currentQuestion.title += line;
      } else {
        currentQuestion.title = line;
      }
    } else {
      if (currentQuestion.title) {
        currentQuestion.title += line;
      } else if (questions[questions.length - 1] && questions[questions.length - 1].explain) {
        questions[questions.length - 1].explain += line;
      } else {
        currentQuestion.title = line;
      }
    }
  }

  if (currentQuestion.title) {
    // 最后一题
    const find = findInlineAnswer(currentQuestion.title);
    if (find) {
      currentQuestion.title = removeAnswerFromTitle(currentQuestion.title);
      currentQuestion.answer = find.answer;
      currentQuestion.options = find.type === 'letter' ? currentOptions : ['正确', '错误'];
      if (find.multiple) {
        currentQuestion.type = 'multiple';
      } else {
        currentQuestion.type = 'single';
      }
      questions.push(currentQuestion);
    }
  }

  console.log(questions);
  return questions;
}

function checkSingle(answer: number, userAnswer: number): boolean {
  // 检查单选题
  return answer === userAnswer;
}

function checkMultiple(answer: Array<number>, userAnswer: Array<number>): boolean {
  // 检查多选题
  if (!answer || !userAnswer || answer.length !== userAnswer.length) {
    return false;
  }
  answer.sort();
  userAnswer.sort();

  let correct = true;
  for (let i = 0; i < answer.length; i++) {
    if (answer[i] !== userAnswer[i]) {
      correct = false;
      break;
    }
  }
  return correct;
}

function checkBlank(answer: Array<string>, userAnswer: Array<string>): boolean {
  // 检查填空题
  if (!answer || !userAnswer || answer.length !== userAnswer.length) {
    return false;
  }

  for (let i = 0; i < answer.length; i++) {
    if (answer[i].trim().toLowerCase() !== userAnswer[i].trim().toLowerCase()) {
      return false;
    }
  }
  return true;
}
