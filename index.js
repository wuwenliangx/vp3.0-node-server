const path = require("path"); //处理路径
const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment");
const cors = require("cors"); // 处理跨域
const formidable = require("formidable"); // 处理文件上传
const fs = require("fs");
const nodeExcel = require("excel-export"); // excel导出

/* 注意：excel-export 这个包 覆盖了 es6 中 的 find 方法，给Array定义myFind函数 */
require("./utils/myFind");

/* 模拟数据 */
let {
  likes,
  genders,
  citys,
  icons,
  images,
  videos,
  users,
  trees,
} = require("./utils/data");

/* 操作树的工具函数 */
const {
  findPathByLeafId,
  deleteByLeafId,
  getAllNodeIds,
  getNodesByIds,
} = require("./utils/treeU");

let app = express();
let router = express.Router();

app.listen(9547, () => {
  console.log(":9547 服务器已启动...");
});

/* 跨域配置 */
var corsOptions = {
  origin: ["http://192.168.191.155:9003", "http://192.168.181.111:9003", "*"],
  methods: ["GET", "PUT", "POST"],
  credentials: true,
  preflightContinue: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Auth-Token",
    "responseType",
  ],
};

/** 多文件上传 */
function multiUpload(req, res) {
  let form = new formidable.IncomingForm();
  form.uploadDir = "./public/uploadFiles"; //设置上传文件保存目录./public/uploadFiles
  form.multiples = true; //设置为多文件上传
  form.keepExtensions = true; //是否包含文件后缀
  var files = [];
  form.on("file", (filed, file) => {
    files.push([filed, file]);
  });
  form.parse(req, (err, fields, files) => {
    if (err) return next(err);
    console.log(fields);
    console.log(files);

    let newPaths = [];
    if (Array.isArray(files.myFile)) {
      for (let f of files.myFile) {
        fn(f);
      }
    } else {
      fn(files.myFile);
    }

    function fn(f) {
      let extname = path.extname(f.name); //获取文件扩展名
      let oldpath = f.path;
      let newpath = `public/uploadFiles/${Date.now()}${extname}`;
      fs.renameSync(oldpath, newpath);
      newPaths.push(newpath);
    }

    res.json({
      STATUS: "200",
      RESULT: {
        data: {
          url: newPaths,
        },
      },
    });
  });
}
/** 单文件上传 */
function upload(req, res) {
  let form = new formidable.IncomingForm();
  form.uploadDir = "./public/uploadFiles"; //设置上传文件保存目录./public/uploadFiles
  form.parse(req, (err, fields, files) => {
    if (err) return next(err);
    console.log(fields); // 额外数据字段
    // console.log(files); // 文件
    let extname = path.extname(files.myFile.name); //获取文件扩展名
    let oldpath = files.myFile.path;
    let newpath =
      "public/uploadFiles/" +
      (moment().format("YYYYMMDDHHmmss") + "-" + moment().valueOf() + extname);
    fs.rename(`${__dirname}/${oldpath}`, `${__dirname}/${newpath}`, (err) => {
      if (err) {
        throw Error("改名失败");
      }
    });
    setTimeout(function () {
      res.json({
        STATUS: "200",
        RESULT: {
          data: {
            id: Date.now(),
            url: newpath,
            createtime: moment().format("YYYY-MM-DD"),
          },
        },
      });
    }, 1000);
  });
}

/** 用户获取 */
function userGet(req, res) {
  let formData = req.body;
  console.log(moment().format("YYYY-MM-DD HH:mm:ss"), req.url, formData);

  let id = formData.id;
  if (!id) {
    res.json({ STATUS: "500", RESULT: "用户ID参数有误" });
  } else {
    let user = users.myFind((v) => v.id === id);
    if (user) {
      res.json({
        STATUS: "200",
        RESULT: {
          list: [user],
        },
      });
    } else {
      res.json({
        STATUS: "200",
        RESULT: {
          list: [],
        },
      });
    }
  }
}
/** 用户更新 */
function userUpdate(req, res) {
  let formData = req.body;
  console.log(moment().format("YYYY-MM-DD HH:mm:ss"), req.url, formData);

  if (
    !formData.name ||
    !formData.birth ||
    !formData.genderId ||
    !formData.likeId ||
    !formData.cityId ||
    !formData.introduce
  ) {
    res.json({ STATUS: "500", RESULT: { msg: "请填写所有内容" } });
    return;
  }

  let genderId = formData.genderId;
  let gender = genders.myFind((v) => v.id === genderId).name;
  let cityId = formData.cityId;
  let city = citys.myFind((v) => v.id === cityId).name;
  let likeId = formData.likeId;
  let like = [];
  likeId = likeId.split(",");
  for (let v of likeId) {
    let lk = likes.myFind((x) => x.id === v);
    if (lk) {
      like.push(lk.name);
    }
  }

  if (formData.id) {
    let user = users.myFind((v) => v.id === formData.id);
    if (user) {
      user.name = formData.name;
      user.birth = formData.birth;
      user.gender = gender;
      user.genderId = genderId;
      user.city = city;
      user.cityId = cityId;
      user.like = like.join(",");
      user.likeId = likeId.join(",");
      user.introduce = formData.introduce;
      res.json({ STATUS: "200", RESULT: "编辑成功" });
    } else {
      res.json({
        STATUS: "500",
        RESULT: { msg: "编辑失败，未找到对应用户" },
      });
    }
  } else {
    users.push({
      id: UUIDFactory(),
      name: formData.name,
      birth: formData.birth,
      gender: gender,
      genderId: genderId,
      city: city,
      cityId: cityId,
      like: like.join(","),
      likeId: likeId.join(","),
      introduce: formData.introduce,
    });
    res.json({ STATUS: "200", RESULT: { msg: "添加成功" } });
  }
}
/** 用户列表 */
function userList(req, res) {
  let formData = req.body;
  console.log(moment().format("YYYY-MM-DD HH:mm:ss"), req.url, formData);

  let page = formData.page;
  let pageSize = formData.pageSize;

  /*    1     0                   9                    10
        2     10                  19                   10
        3     20                  29                   10
        page  (page-1)*pageSize   page*pageSize-1      pageSize */

  if (page && pageSize) {
    res.json({
      STATUS: "200",
      RESULT: {
        page: page,
        num: users.length,
        list: users.slice((page - 1) * pageSize, page * pageSize),
      },
    });
  } else {
    res.json({
      STATUS: "200",
      RESULT: {
        list: users,
      },
    });
  }
}
/** 用户搜索 */
function userSearch(req, res) {
  let formData = req.body;
  console.log(moment().format("YYYY-MM-DD HH:mm:ss"), req.url, formData);

  let page = formData.page;
  let pageSize = formData.pageSize;

  let name = formData.name;
  let genderId = formData.genderId;
  let start = formData.start;
  let end = formData.end;
  let cityId = formData.cityId;
  let likeId = formData.likeId;

  let usersCache = [].concat(users);

  usersCache = name
    ? usersCache.filter((v) => v.name.indexOf(name) > -1)
    : usersCache;
  usersCache = genderId
    ? usersCache.filter((v) => v.genderId === genderId)
    : usersCache;
  usersCache =
    start && end
      ? usersCache.filter(
          (v) =>
            new Date(v.birth) >= new Date(start) &&
            new Date(v.birth) <= new Date(end)
        )
      : usersCache;
  usersCache = cityId
    ? usersCache.filter((v) => v.cityId === cityId)
    : usersCache;
  if (likeId) {
    let usersTmp = [];
    likeId = likeId.split(",");
    if (Array.isArray(likeId) && likeId.length > 0) {
      for (let x of usersCache) {
        for (let v of likeId) {
          if (x.likeId.indexOf(v) > -1) {
            usersTmp.push(x);
            break;
          }
        }
      }
    } else {
      usersTmp = [].concat(usersCache);
    }
    usersCache = [].concat(usersTmp);
  }

  /*    1    0                   9                    10
        2    10                  19                   10
        3    20                  29                   10
        page (page-1)*pageSize   page*pageSize-1      pageSize */

  if (page && pageSize) {
    res.json({
      STATUS: "200",
      RESULT: {
        page: page,
        num: usersCache.length,
        list: usersCache.slice((page - 1) * pageSize, page * pageSize),
      },
    });
  } else {
    res.json({
      STATUS: "200",
      RESULT: {
        list: usersCache,
      },
    });
  }
}
/** 用户导出 */
function userExport(req, res) {
  let formData = req.body;
  console.log(moment().format("YYYY-MM-DD HH:mm:ss"), req.url, formData);

  let page = formData.page;
  let pageSize = formData.pageSize;

  let name = formData.name;
  let genderId = formData.genderId;
  let start = formData.start;
  let end = formData.end;
  let cityId = formData.cityId;
  let likeId = formData.likeId;

  let usersCache = [].concat(users);

  usersCache = name
    ? usersCache.filter((v) => v.name.indexOf(name) > -1)
    : usersCache;
  usersCache = genderId
    ? usersCache.filter((v) => v.genderId === genderId)
    : usersCache;
  usersCache =
    start && end
      ? usersCache.filter(
          (v) =>
            new Date(v.birth) >= new Date(start) &&
            new Date(v.birth) <= new Date(end)
        )
      : usersCache;
  usersCache = cityId
    ? usersCache.filter((v) => v.cityId === cityId)
    : usersCache;
  if (likeId) {
    let usersTmp = [];
    likeId = likeId.split(",");
    if (Array.isArray(likeId) && likeId.length > 0) {
      for (let x of usersCache) {
        for (let v of likeId) {
          if (x.likeId.indexOf(v) > -1) {
            usersTmp.push(x);
            break;
          }
        }
      }
    } else {
      usersTmp = [].concat(usersCache);
    }
    usersCache = [].concat(usersTmp);
  }

  let conf = {};
  let fileName = `用户列表导出-${Date.now()}`;
  conf.name = "Sheet1"; //这里标识在excel底部的表名

  // 列配置
  conf.cols = [
    { caption: "姓名", type: "string" },
    { caption: "性别", type: "string" },
    { caption: "出生日期", type: "string" },
    { caption: "爱好", type: "string" },
    { caption: "城市", type: "string" },
    { caption: "个人简介", type: "string" },
  ];

  let usersRows = [];
  for (let v of usersCache) {
    usersRows.push([
      v.name,
      v.gender,
      v.birth,
      v.like,
      v.cityCode,
      v.introduce,
    ]);
  }
  // 行配置
  conf.rows = [].concat(usersRows);

  let result = nodeExcel.execute(conf);
  res.setHeader("Content-Type", "application/octet-stream;charset=UTF-8");
  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + encodeURIComponent(fileName) + ".xlsx"
  ); //中文名需要进行url转码
  res.setTimeout(30 * 60 * 1000); //防止网络原因造成超时。
  res.end(result, "binary");
}
/** 用户删除 */
function userDelete(req, res) {
  let formData = req.body;
  console.log(moment().format("YYYY-MM-DD HH:mm:ss"), req.url, formData);

  let id = formData.id;
  if (!id) {
    res.json({ STATUS: "500", RESULT: { msg: "用户ID不存在！" } });
  } else {
    let index = users.findIndex((v) => v.id === id);
    if (index > -1) {
      users.splice(index, 1);
      res.json({ STATUS: "200", RESULT: { msg: "删除成功！" } });
    } else {
      res.json({ STATUS: "500", RESULT: { msg: "用户不存在，删除失败！" } });
    }
  }
}
/** 用户生日时间轴 */
function userBirthTimeline(req, res) {
  let formData = req.body;
  console.log(moment().format("YYYY-MM-DD HH:mm:ss"), req.url, formData);

  const sort = formData.sort || "asc";
  const us = users.sort(function (a, b) {
    return sort === "desc"
      ? new Date(b.birth) - new Date(a.birth)
      : new Date(a.birth) - new Date(b.birth);
  });
  res.json({
    STATUS: "200",
    RESULT: {
      list: us,
    },
  });
}

/** 城市列表 */
function cityList(req, res) {
  res.json({ STATUS: "200", RESULT: { list: citys } });
}
/** 爱好列表 */
function likeList(req, res) {
  res.json({ STATUS: "200", RESULT: { list: likes } });
}
/** 性别列表 */
function genderList(req, res) {
  res.json({ STATUS: "200", RESULT: { list: genders } });
}
/** 树 */
function tree(req, res) {
  res.json({ STATUS: "200", RESULT: { list: trees } });
}
/** 树节点编辑-添加/更新 */
function treeNodeEdit(req, res) {
  let formData = req.body;
  console.log(moment().format("YYYY-MM-DD HH:mm:ss"), req.url, formData);

  let id = formData.id; // 节点ID
  let name = formData.name; // 节点名称
  let pid = formData.pid; // 父节点ID

  if (!id || !name) {
    res.json({
      STATUS: "500",
      RESULT: { msg: "参数有误，节点名称和ID不能为空" },
    });
    return;
  }

  const info1 = findPathByLeafId(id, trees); // 根据ID在树中查找节点
  // 节点已存在，更新
  if (info1 && info1.node) {
    const node = info1.node;
    node.id = id;
    node.label = name;
    res.json({ STATUS: "200", RESULT: { msg: "更新成功" } });
  }
  // 节点不存在，添加
  else {
    // 父节点不存在，不能添加
    if (!pid) {
      res.json({ STATUS: "500", RESULT: { msg: "父节点ID不存在，添加失败" } });
      return;
    }
    // 添加
    else {
      const info2 = findPathByLeafId(pid, trees); // 根据PID在树中查找父节点是否存在
      // 父节点存在，添加
      if (info2 && info2.node) {
        const node = info2.node;
        node.children = node.children ? node.children : [];
        node.children.push({
          id: id,
          label: name,
          level: node.level + 1,
          children: [],
        });
        res.json({ STATUS: "200", RESULT: { msg: "添加成功" } });
      }
      // 父节点不存在，不能添加
      else {
        res.json({ STATUS: "500", RESULT: { msg: "父节点不存在，添加失败" } });
      }
    }
  }
}
/** 树节点删除 */
function treeNodeDelete(req, res) {
  let formData = req.body;
  console.log(moment().format("YYYY-MM-DD HH:mm:ss"), req.url, formData);

  let id = formData.id;
  const deleteInfo = deleteByLeafId(id, trees);
  if (deleteInfo) {
    const node = deleteInfo.node;
    if (node) {
      res.json({ STATUS: "200", RESULT: { msg: "删除成功" } });
      return;
    }
  }
  res.json({ STATUS: "500", RESULT: { msg: "删除失败" } });
}

/** 请求测试 */
function httpTest(req, res) {
  let formData = req.body;
  console.log(moment().format("YYYY-MM-DD HH:mm:ss"), req.url, formData);

  res.json({ STATUS: "200", RESULT: { list: formData } });
}

router.post("/multiUpload", multiUpload);
router.post("/upload", upload);

router.post("/user", userGet);
router.post("/user/update", userUpdate);
router.post("/user/list", userList);
router.post("/user/search", userSearch);
router.post("/user/export", userExport);
router.post("/user/delete", userDelete);
router.post("/user/birthTimeline", userBirthTimeline);

router.post("/city/list", cityList);
router.post("/like/list", likeList);
router.post("/gender/list", genderList);

router.post("/tree", tree);
router.post("/tree/edit", treeNodeEdit);
router.post("/tree/delete", treeNodeDelete);

router.post("/httpTest", httpTest);

app.use(cors(corsOptions)); // 跨域
app.use("/public", express.static("./public")); //express静态资源托管，暴露public
app.use(bodyParser.json()); //  application/json parser
app.use(bodyParser.urlencoded({ extended: false })); //  application/x-www-form-urlencoded parser
app.use(router);
