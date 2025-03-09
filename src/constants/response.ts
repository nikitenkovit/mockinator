export enum ResponseTypeEnum {
  Success = 'SUCCESS',
  Error = 'ERROR',
  Redirect = 'REDIRECT',
}

export enum ResponseSuccessTypeEnum {
  JSON = 'JSON',
  Text = 'Text',
  HTML = 'HTML',
  XML = 'XML',
}

export const responseExamples = {
  [ResponseSuccessTypeEnum.JSON]: JSON.stringify({
    title: 'Пример JSON ответа',
  }),
  [ResponseSuccessTypeEnum.Text]: 'Пример текстового ответа',
  [ResponseSuccessTypeEnum.HTML]: '<h1>Пример HTML ответа</h1>',
  [ResponseSuccessTypeEnum.XML]: '<root><item>Пример XML ответа</item></root>',
};
