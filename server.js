const http = require("http");
const mongoose = require("mongoose");
const Post = require("./models/post");

mongoose
  .connect("mongodb://127.0.0.1:27017/testPost")
  .then(() => console.log("資料庫連接成功"));

const requestListener = async (req, res) => {
  //   console.log("req.url:" + req.url);
  //   console.log("req.method:" + req.method);
  const header = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };

  let body = "";
  //持續抓封包傳資料
  req.on("data", (chunk) => {
    //console.log("chunk" + chunk);
    body += chunk;
  });
  //當chunk全部傳送完成時會觸發"end"事件
  //   req.on("end", () => {
  //     console.log("req.bodyData:" + JSON.parse(body).content);
  //   });

  if (req.url == "/posts" && req.method == "GET") {
    // 查詢
    const allPosts = await Post.find();

    res.writeHead(200, header);
    //回傳JSON資料，要把物件轉成字串格式! 因為網路無法解析物件格式
    res.write(JSON.stringify({ status: "true", data: allPosts }));
    res.end();
  } else if (req.url == "/posts" && req.method == "POST") {
    // 新增
    req.on("end", async () => {
      try {
        const data = await JSON.parse(body);
        if (data.content !== undefined) {
          const newPost = Post.create({
            content: data.content,
            image: data.image,
            name: data.name,
            likes: data.likes,
          });
          res.writeHead(200, header);
          res.write(JSON.stringify({ status: "true", data: data }));
          res.end();
        } else {
          res.writeHead(400, header);
          res.write(
            JSON.stringify({
              status: "false",
              data: "欄位未填寫正確，或無此 todo ID",
            })
          );
          res.end();
        }
      } catch (error) {
        res.writeHead(400, header);
        res.write(JSON.stringify({ status: "false", data: error }));
        res.end();
      }
    });
  } else if (req.url == "/posts" && req.method == "DELETE") {
    // 刪除
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        let result = "";
        console.log(data._id);

        if (data._id !== undefined) {
          const deletePost = await Post.findByIdAndDelete({
            // _id: `ObjectId('${data._id}')`,
            _id: data._id,
          });
          //console.log("deletePost:" + deletePost);

          if (deletePost == null) {
            result = "刪除失敗! 查無資料";
          } else {
            result = "資料刪除成功";
          }

          res.writeHead(200, header);
          res.write(
            JSON.stringify({
              status: "true",
              data: result,
            })
          );
          res.end();
        } else {
          res.writeHead(400, header);
          res.write(
            JSON.stringify({
              status: "false",
              data: "欄位未填寫正確，或無此 todo ID",
            })
          );
          res.end();
        }
      } catch (error) {
        res.writeHead(400, header);
        res.write(JSON.stringify({ status: "false", data: "" + error }));
        res.end();
      }
    });
  } else if (req.url == "/posts" && req.method == "PATCH") {
    // 更新
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);

        if (data._id !== undefined) {
          let updatePost = await Post.findByIdAndUpdate(
            { _id: data._id },
            {
              content: data.content,
              image: data.image,
              name: data.name,
              likes: data.likes,
            }
          );

          if (updatePost == null) {
            res.writeHead(200, header);
            res.write(
              JSON.stringify({ status: "false", data: "修改失敗! 查無此資料" })
            );
            res.end();
          } else {
            res.writeHead(200, header);
            res.write(JSON.stringify({ status: "true", data: data }));
            res.end();
          }
        } else {
          res.writeHead(400, header);
          res.write(
            JSON.stringify({
              status: "false",
              data: "欄位未填寫正確，或無此 todo ID",
            })
          );
          res.end();
        }
      } catch (error) {
        res.writeHead(404, header);
        res.write(JSON.stringify({ status: "false", data: "錯誤：" + error }));
        res.end();
      }
    });
  } else if (req.method == "OPTIONS") {
    //處理預檢請求
    req.writeHead(200, header);
    req.end();
  } else {
    res.writeHead(404, header);
    res.write(JSON.stringify({ status: "false", data: "404 無此網路路由" }));
    res.end();
  }
};
const server = http.createServer(requestListener);
server.listen(3000);
