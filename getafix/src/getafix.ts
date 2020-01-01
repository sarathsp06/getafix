import * as request from "request-promise-native";
import {log} from "./utils";

class Getafix {
  baseUrl: string;
  sessionId?: string;

  constructor(url: string) {
    this.baseUrl = url;
  }

  WebhookURL = () => `${this.baseUrl}/sessions/${this.sessionId!}`;
  LogURL = () => `${this.baseUrl}/sessions/${this.sessionId!}/logs`;
  NewSessionURL = () => `${this.baseUrl}/sessions`;

  async NewSession() {
    const result = await request.post({ url: this.NewSessionURL() });
    console.log(result);
    this.sessionId = JSON.parse(result).session_id;
    return true;
  }

  async GetRequests() {
    log("reqeusting for logs: "+this.LogURL());
    const result = await request.get({ url: this.LogURL() });
    log(result);
    return JSON.parse(result);
  }
}

export default Getafix;
