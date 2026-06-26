var Cities =
[
  {
    Name      :
    {
      en: 'San Francisco',
      ru: 'Сан-Франциско',
      fr: 'San Francisco',
      es: 'San Francisco',
      de: 'San Francisco'
    },
    OffsetX   : 62,
    OffsetY   : 430,
    GmtBias   :-8,
    DstType   : 'relative',
    DstStart  : { nth: 2, weekday: 1, month: 3 },
    DstEnd    : { nth: 1, weekday: 1, month: 11 },
    DstBias   : 1
  },
  {
    Name      :
    {
      en: 'New York',
      ru: 'Нью-Йорк',
      fr: 'New York',
      es: 'Nueva York',
      de: 'New York'
    },
    OffsetX   : 295,
    OffsetY   : 419,
    GmtBias   :-5,
    DstBias   : 1,
    DstType   : 'relative',
    DstStart  : { nth: 2, weekday: 1, month: 3 },
    DstEnd    : { nth: 1, weekday: 1, month: 11 },
    DstBias   : 1
  },
  {
    Name      :
    {
      en: 'Buenos-Aires',
      ru: 'Буэнос-Айрес',
      fr: 'Buenos-Aires',
      es: 'Buenos Aires',
      de: 'Buenos Aires'
    },
    OffsetX   : 339,
    OffsetY   : 810,
    GmtBias   :-3,
    DstBias   : 0
  },
  {
    Name      :
    {
      en: 'London',
      ru: 'Лондон',
      fr: 'Londres',
      es: 'Londres',
      de: 'London'
    },
    OffsetX   : 556,
    OffsetY   : 358,
    LiftLabel : '-1em',
    GmtBias   : 0,
    DstType   : 'relative',
    DstStart  : { nth: -1, weekday: 1, month: 3 },
    DstEnd    : { nth: -1, weekday: 1, month: 10 },
    DstBias   : 1
  },
  {
    Name      :
    {
      en: 'Paris',
      ru: 'Париж',
      fr: 'Paris',
      es: 'Paris',
      de: 'Paris'
    },
    OffsetX   : 576,
    OffsetY   : 376,
    GmtBias   : 1,
    DstType   : 'relative',
    DstStart  : { nth: -1, weekday: 1, month: 3 },
    DstEnd    : { nth: -1, weekday: 1, month: 10 },
    DstBias   : 1
  },
  {
    Name      :
    {
      en: 'Moscow',
      ru: 'Москва',
      fr: 'Moscou',
      es: 'Mosc&uacute;',
      de: 'Moskau'
    },
    OffsetX   : 776,
    OffsetY   : 286,
    GmtBias   : 3
  },
  {
    Name      :
    {
      en: 'Peking',
      ru: 'Пекин',
      fr: 'P&eacute;kin',
      es: 'Pekin',
      de: 'Peking'
    },
    OffsetX   : 1080,
    OffsetY   : 438,
    GmtBias   : 8,
    DstBias   : 0
  },
  {
    Name      :
    {
      en: 'Tokyo',
      ru: 'Токио',
      fr: 'Tokyo',
      es: 'Tokio',
      de: 'Tokio'
    },
    OffsetX   : 1168,
    OffsetY   : 450,
    GmtBias   : 9,
    DstBias   : 0
  },
  {
    Name      :
    {
      en: 'Sydney',
      ru: 'Сидней',
      fr: 'Sydney',
      es: 'Sidney',
      de: 'Sydney'
    },
    OffsetX   : 1218,
    OffsetY   : 796,
    GmtBias   : 11,
    DstType   : 'relative',
    DstStart  : { nth: -1, weekday: 1, month: 3 },
    DstEnd    : { nth: -1, weekday: 1, month: 10 },
    DstBias   : -1
  },
  {
     Name     :
     {
      en: 'Jakarta',
      ru: 'Джакарта',
      fr: 'Jakarta',
      es: 'Yakarta',
      de: 'Jakarta'
     },
    OffsetX   : 1029,
    OffsetY   : 650,
    GmtBias   : 7,
    DstBias   : 0
  },
/*
  {
     Name     :
     {
      en: 'Plovdiv',
      ru: 'Пловдив',
      fr: 'Plovdiv',
      es: 'Plovdiv',
      de: 'Plovdiv'
     },
    OffsetX   : 676,
    OffsetY   : 422,
    GmtBias   : 2,
    DstBias   : 1
  },
*/
];

var TimeFormat =
{
  en: 12,
  ru: 24,
  fr: 24,
  es: 24,
  de: 24
};
