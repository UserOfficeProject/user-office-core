import JSDict from "../utils/Dictionary";

export class ProposalModel {
  questions = JSDict.Create<string, Question>();

  addQuestion(question: Question) {
    this.questions.put(question.id, question);
  }

  addDependency(
    questionFromId: string,
    questionToId: string,
    conditions: Array<DependencyCondition>
  ) {
    var from = this.getQuestion(questionFromId)!;
    var to = this.getQuestion(questionToId)!;
    if (from && to) {
      from.addDependency(to, conditions);
      return true;
    }
    return false;
  }

  getQuestion(id: string): Question | null {
    return this.questions.get(id);
  }

  getAllQuestions() {
    return this.questions.getValues();
  }

  getQuestionById(id: string): Question | undefined {
    return this.getAllQuestions().find(question => question.id === id);
  }
}

export class QuestionDependency {
  constructor(
    public from: Question,
    public to: Question,
    public conditions: Array<DependencyCondition>
  ) {}

  isEffective(): boolean {
    if (this.conditions === null) {
      return true;
    }

    let isEffective = true;
    this.conditions.forEach(condition => {
      isEffective = isEffective && this.from.value === condition.value;
    });
    return isEffective;
  }
}

export class DependencyCondition {
  constructor(public value: string) {}
}

export class Question {
  dependencies: Array<QuestionDependency> = [];
  id: string;
  dataType: string;
  value: any;
  configuration: any;

  constructor(field: FieldDto) {
    this.id = field.id;
    this.dataType = field.dataType;
    this.configuration = field.configuration as object;
  }

  addDependency(questionB: Question, condition: Array<DependencyCondition>) {
    this.dependencies.push(new QuestionDependency(this, questionB, condition));
  }
}

export default class ProposalDto {
  fields!: Array<FieldDto>;
}

export class FieldDto {
  dataType!: string;
  id!: string;
  label!: string;
  edges!: Array<EdgeDto> | null;
  configuration!: object | null;
}

export class EdgeDto {
  to!: string;
  ifValue!: string;
}
