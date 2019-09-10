export class QCMState {
  // Le status est pour le success ou failure
  constructor(public id: number, public status: boolean, public score: number) {}
}

export class QCMQuestions {
  constructor(public id: number, public title, public text: string, public qcmResponses: QCMResponses[], public idCorrectResponse: number) {}
}

export class QCMResponses {
  constructor(public id?: number, public text?: string, public correct?: boolean) {}
}
