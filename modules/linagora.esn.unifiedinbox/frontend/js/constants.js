'use strict';

angular.module('linagora.esn.unifiedinbox')

  .constant('INBOX_MODULE_NAME', 'linagora.esn.unifiedinbox')
  .constant('MAILBOX_ROLE_ICONS_MAPPING', {
    default: 'mdi mdi-email',
    inbox: 'mdi mdi-inbox',
    archive: 'mdi mdi-archive',
    drafts: 'mdi mdi-file-document',
    outbox: 'mdi mdi-outbox',
    sent: 'mdi mdi-send',
    trash: 'mdi mdi-delete',
    spam: 'mdi mdi-alert-octagon',
    templates: 'mdi mdi-clipboard-text',
    all: 'mdi mdi-folder-outline'
  })
  .constant('INBOX_AUTOCOMPLETE_LIMIT', 20)
  .constant('MAILBOX_LEVEL_SEPARATOR', ' / ')
  .constant('JMAP_GET_MESSAGES_LIST', ['id', 'threadId', 'subject', 'from', 'preview', 'date', 'isUnread', 'isFlagged', 'isDraft', 'hasAttachment', 'mailboxIds'])
  .constant('JMAP_GET_MESSAGES_VIEW', ['id', 'threadId', 'subject', 'from', 'to', 'cc', 'bcc', 'replyTo', 'preview', 'textBody', 'htmlBody', 'date', 'isUnread', 'isFlagged', 'isDraft', 'hasAttachment', 'attachments', 'mailboxIds'])
  .constant('ATTACHMENTS_ATTRIBUTES', ['blobId', 'isInline', 'name', 'size', 'type'])
  .constant('DEFAULT_MAX_SIZE_UPLOAD', 20971520)
  .constant('DRAFT_SAVING_DEBOUNCE_DELAY', 1000)
  .constant('DEFAULT_VIEW', 'messages')
  .constant('IFRAME_MESSAGE_PREFIX', '[linagora.esn.unifiedinbox.changeDocument]')
  .constant('MAILTO_URL_MESSAGE_PREFIX', '[linagora.esn.unifiedinbox.mailtoClick]')
  .constant('INBOX_SWIPE_DURATION', 500)
  .constant('INBOX_DEFAULT_AVATAR', '/images/user.png');
