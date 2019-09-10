import { QCMQuestions } from './qcm.model';

export class Courses {
  constructor(public id: number, public text: string, public idStudentSubscriber: number[], public category) {}
}

export class CoursesFollowed {
  constructor(public idCourse: number, public chaptersTotal: number, public chapterComplete: number[]) {}
}
