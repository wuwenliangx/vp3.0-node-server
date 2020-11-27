const UUIDFactory = require("./uuid");
const moment = require("moment");
const _ = require("lodash");

const likes = [
  { id: "running", name: "跑步" },
  { id: "reading", name: "阅读" },
  { id: "singing", name: "唱歌" },
  { id: "dancing", name: "跳舞" },
];

const genders = [
  { id: "male", name: "男" },
  { id: "female", name: "女" },
  { id: "other", name: "其他" },
];

const citys = [
  { id: "010", name: "北京" },
  { id: "020", name: "上海" },
  { id: "0371", name: "郑州" },
  { id: "0391", name: "焦作" },
];

const icons = [
  "icon-zujian_zhexiantu",
  "icon-tubiao_dangqianxiangmu",
  "icon-yiji-FunctionStudio",
  "icon-tubiao_xiangmushuguanli",
];
const images = [
  "../../image/img/logo.png",
  "../../image/img/result.png",
  "../../image/img/2020.png",
];
const videos = [
  "../../public/other/mov_bbb.mp4",
  "../../public/other/movie.ogv",
];

const users = [
  {
    id: UUIDFactory(),
    name: "小冲冲",
    birth: "1988-06-16",
    gender: "女",
    genderId: "female",
    like: ["阅读", "唱歌"].join(","),
    likeId: ["reading", "singing"].join(","),
    city: "郑州",
    cityId: "0371",
    introduce: "我是一个严肃的律师",
  },
  {
    id: UUIDFactory(),
    name: "彧",
    birth: "1990-09-09",
    gender: "男",
    genderId: "male",
    like: ["唱歌", "跑步", "跳舞"].join(","),
    likeId: ["singing", "running", "dancing"].join(","),
    city: "焦作",
    cityId: "0391",
    introduce: "我是一个逗逼程序员",
  },
  {
    id: UUIDFactory(),
    name: "颖颖",
    birth: "1989-07-26",
    gender: "女",
    genderId: "female",
    like: ["唱歌"].join(","),
    likeId: ["singing"].join(","),
    city: "焦作",
    cityId: "0391",
    introduce: "我是一个沉默的审计",
  },
];

const trees = [
  {
    id: "010",
    label: "北京",
    level: 1,
    children: [
      {
        id: "010-CY",
        label: "朝阳区",
        level: 2,
        children: [
          { id: "010-CY-AYC", label: "奥运村街道", level: 3, children: [] },
          { id: "010-CY-YYC", label: "亚运村街道", level: 3, children: [] },
        ],
      },
      {
        id: "010-CP",
        label: "昌平区",
        level: 2,
        children: [
          {
            id: "010-CP-TTYB",
            label: "天通苑北街道",
            level: 3,
            children: [],
          },
        ],
      },
    ],
  },
  { id: "020", label: "上海", level: 1, children: [] },
  { id: "0371", label: "郑州", level: 1, children: [] },
  { id: "0391", label: "焦作", level: 1, children: [] },
];

const form = {
  label: users[0].name,
  p: users[0].introduce,
  input: users[0].name,
  textarea: users[0].introduce,
  switch: "good",
  select: users[0].cityId,
  selectMul: _.uniq(users.map(v => v.cityId)).join(","),
  radio: users[0].genderId,
  checkbox: users[0].likeId,
  calendar: users[0].birth,
  calendarMul: [users[0].birth, moment().format('YYYY-MM-DD')].join(","),
  icon: icons[0],
  image: images[0],
  video: videos[0],
  tree: "020",
  treeMul: "010,010-CY,010-CY-AYC,010-CP-TTYB",
  selectTree: "020",
  selectTreeMul: "010,010-CY,010-CP-TTYB",
}

module.exports = {
  likes,
  genders,
  citys,
  icons,
  images,
  videos,
  users,
  trees,
  form
};
