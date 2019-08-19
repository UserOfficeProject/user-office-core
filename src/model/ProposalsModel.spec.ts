import { ProposalModel, Question, FieldDto, DependencyCondition, QuestionDependency } from "./ProposalModel";

let model:ProposalModel;
let fieldA:FieldDto;
let fieldB:FieldDto;
let questionA:Question;
let questionB:Question;

beforeEach(() => {
    model = new ProposalModel();

    fieldA = new FieldDto();
    fieldA.id = 'fieldA';

    fieldB = new FieldDto();
    fieldB.id = 'fielBA';

    questionA = new Question(fieldA);
    questionB = new Question(fieldB);
});

test("Can retrieve a question", () => {
    model.addQuestion(questionA);
    expect(model.getQuestionById(questionA.id)).not.toBe(null);
});

test("Question can be added to model", () => {
  model.addQuestion(questionA);
  expect(model.getAllQuestions().length).toBe(1);

  model.addQuestion(questionB);
  expect(model.getAllQuestions().length).toBe(2);

  model.addQuestion(questionA);
  expect(model.getAllQuestions().length).toBe(2);
});

test("Can configure, add and retrieve question from proposal model", () => {
    questionA.addDependency(questionB, [new DependencyCondition("")]);
    model.addQuestion(questionA);
    model.addQuestion(questionB);

    let questionAFound = model.getQuestionById(questionA.id); 
    expect(questionAFound).not.toBe(null);
    expect(questionAFound!.dependencies.length).toBe(1);
});

test("Can add dependency for question using model API", () => {
    model.addQuestion(questionA);
    model.addQuestion(questionB);
    model.addDependency(questionA.id, questionB.id, [new DependencyCondition("")]);

    expect(model.getQuestionById(questionA.id)!.dependencies.length).toBe(1);
})
