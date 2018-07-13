const { baseUrlWebhook } = process.env;

exports.h7OpportunityTrigger = {
  Body: `trigger h7OpportunityTrigger on Opportunity (after insert, after update, after delete, after undelete) {
    String url = '${baseUrlWebhook}/webhooks/opportunity';
    String content = h7WebhookClass.jsonContent(Trigger.new, Trigger.old);
    h7WebhookClass.callout(url, content);
  }`,
  TableEnumOrId: 'Opportunity',
};

exports.h7EventTrigger = {
  Body: `trigger h7EventTrigger on Event (after insert, after update, after delete, after undelete) {
    String url = '${baseUrlWebhook}/webhooks/event';
    String content = h7WebhookClass.jsonContent(Trigger.new, Trigger.old);
    h7WebhookClass.callout(url, content);
  }`,
  TableEnumOrId: 'Event',
};

exports.h7TaskTrigger = {
  Body: `trigger h7TaskTrigger on Task (after insert, after update, after delete, after undelete) {
    String url = '${baseUrlWebhook}/webhooks/task';
    String content = h7WebhookClass.jsonContent(Trigger.new, Trigger.old);
    h7WebhookClass.callout(url, content);
  }`,
  TableEnumOrId: 'Task',
};

exports.h7AccountTrigger = {
  Body: `trigger h7AccountTrigger on Account (after insert, after update) {
    String url = '${baseUrlWebhook}/webhooks/account';
    String content = h7WebhookClass.jsonContent(Trigger.new, Trigger.old);
    h7WebhookClass.callout(url, content);
  }`,
  TableEnumOrId: 'Account',
};

exports.h7UserTrigger = {
  Body: `trigger h7UserTrigger on Account (after insert) {
    String url = '${baseUrlWebhook}/webhooks/user';
    String content = h7WebhookClass.jsonContent(Trigger.new, Trigger.old);
    h7WebhookClass.callout(url, content);
  }`,
  TableEnumOrId: 'User',
};

exports.h7WebhookClass = {
  Body: `public class h7WebhookClass implements HttpCalloutMock {
    public static HttpRequest request;
    public static HttpResponse response;
    public HTTPResponse respond(HTTPRequest req) {
      request = req; response = new HttpResponse();
      response.setStatusCode(200); return response;
    }
    public static String jsonContent(List<Object> triggerNew, List<Object> triggerOld) {
      String newObjects = '[]';
      if (triggerNew != null) {
        newObjects = JSON.serialize(triggerNew);
      }
      String oldObjects = '[]';
      if (triggerOld != null) {
        oldObjects = JSON.serialize(triggerOld);
      }
      String userId = JSON.serialize(UserInfo.getUserId());
      String content = '{"new": ' + JSON.serialize(triggerNew) + ', "old": ' + oldObjects + ', "userId": ' + userId +'}';
      return content;
    }
    @future(callout=true)
    public static void callout(String url, String content) {
      Http h = new Http();
      HttpRequest req = new HttpRequest();
      req.setEndpoint(url);
      req.setMethod('POST');
      req.setHeader('Content-Type', 'application/json');
      req.setBody(content);
      h.send(req);
    }
  }`,
};
