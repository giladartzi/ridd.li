module.exports = {
  "custom_commands_path": "",
  "selenium" : {
    "start_process" : true,
    "server_path" : process.env.SELENIUM_PATH,
    "log_path" : "",
    "host" : "127.0.0.1",
    "port" : 4444,
    "cli_args" : {
      "webdriver.chrome.driver" : "",
      "webdriver.ie.driver" : ""
    }
  },
  "test_settings": {
    "default": {
      "desiredCapabilities": {
        "browserName": "firefox",
        "javascriptEnabled": true,
        "acceptSslCerts": true
      }
    }
  }
};