export const appsScriptCode = (webhookUrl: string) => `
const WEBHOOK_URL = "${webhookUrl}";
const LABEL_NAME = "rheoma-processed";
const START_TIME_KEY = "RHEOMA_START_TIME";
const MAX_PER_RUN = 10; // safety limit

function checkNewEmails() {
  const props = PropertiesService.getScriptProperties();

  // 1️⃣ Auto-initialize once (n8n-style enable trigger)
  let startTime = props.getProperty(START_TIME_KEY);
  if (!startTime) {
    startTime = new Date().toISOString();
    props.setProperty(START_TIME_KEY, startTime);
    return; // IMPORTANT: do not process old emails on first run
  }

  const label = getOrCreateLabel_(LABEL_NAME);
  const afterTs = Math.floor(new Date(startTime).getTime() / 1000);

  // 2️⃣ Fetch only NEW unread emails
  const threads = GmailApp.search(
    \`is:unread after:\${afterTs} -label:\${LABEL_NAME}\`
  );

  let processed = 0;

  for (const thread of threads) {
    const messages = thread.getMessages();

    for (const msg of messages) {
      if (!msg.isUnread()) continue;
      if (processed >= MAX_PER_RUN) break;

      const payload = {
        from: msg.getFrom(),
        to: msg.getTo(),
        subject: msg.getSubject(),
        body: msg.getPlainBody(),
        date: msg.getDate().toISOString(),
        messageId: msg.getId(),
      };

      sendToWebhook_(payload);

      msg.markRead();
      processed++;
    }

    thread.addLabel(label);
    if (processed >= MAX_PER_RUN) break;
  }
}

function sendToWebhook_(payload) {
  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
}

function getOrCreateLabel_(name) {
  const labels = GmailApp.getUserLabels();
  for (const label of labels) {
    if (label.getName() === name) return label;
  }
  return GmailApp.createLabel(name);
}
`;
