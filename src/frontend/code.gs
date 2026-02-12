/**
 * ============================================================================
 * Google Chat → Jira Service Management Incident Bot
 * ============================================================================
 * 
 * COMPLETE SINGLE-FILE IMPLEMENTATION
 * Copy and paste this entire file into Google Apps Script
 * 
 * ============================================================================
 * SETUP INSTRUCTIONS:
 * ============================================================================
 * 
 * 1. In Google Apps Script, go to: Project Settings → Script Properties
 * 
 * 2. Add the following REQUIRED Script Properties:
 *    - JIRA_BASE_URL       (e.g., https://your-domain.atlassian.net)
 *    - JIRA_EMAIL          (e.g., your-email@example.com)
 *    - JIRA_API_TOKEN      (Generate from: Atlassian Account → Security → API tokens)
 * 
 * 3. Add the following OPTIONAL Script Properties (defaults will be used if not set):
 *    - JSM_PROJECT_KEY          (default: 'AIOP')
 *    - INCIDENT_ISSUE_TYPE_ID   (default: '10012')
 *    - BOT_AVATAR_URL           (default: placeholder image)
 * 
 * 4. If any REQUIRED properties are missing, the bot will return a configuration
 *    error card when users try to interact with it.
 * 
 * 5. Deploy this script as a Google Chat app via the Google Cloud Console.
 * 
 * ============================================================================
 * FEATURES:
 * ============================================================================
 * - Welcome greeting and help
 * - List JSM projects
 * - View high/critical incidents
 * - Guided incident creation flow (summary → priority → status)
 * - FAQ and Q&A fallback
 * - All responses use Google Chat cardsV2 format with rich UI
 * - Error handling and validation
 * - User state management for multi-step flows
 * 
 * ============================================================================
 */

/* ===============================
   CONFIG (Load from Script Properties)
   =============================== */

function getConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    JIRA_BASE_URL: props.getProperty('JIRA_BASE_URL') || '',
    JIRA_EMAIL: props.getProperty('JIRA_EMAIL') || '',
    JIRA_API_TOKEN: props.getProperty('JIRA_API_TOKEN') || '',
    JSM_PROJECT_KEY: props.getProperty('JSM_PROJECT_KEY') || 'AIOP',
    INCIDENT_ISSUE_TYPE_ID: props.getProperty('INCIDENT_ISSUE_TYPE_ID') || '10012',
    BOT_AVATAR_URL: props.getProperty('BOT_AVATAR_URL') || 'https://via.placeholder.com/128/FF6B35/FFFFFF?text=AI',
    ALLOWED_STATUSES: ['Open', 'In Progress', 'Resolved', 'Closed', 'Pending']
  };
}

/* ===============================
   MESSAGE HANDLER (Main Entry Point)
   =============================== */

function onMessage(event) {
  const config = getConfig();
  
  // Check configuration
  if (!config.JIRA_BASE_URL || !config.JIRA_EMAIL || !config.JIRA_API_TOKEN) {
    return buildErrorCard('Configuration Missing', 
      'Bot configuration is incomplete. Please contact your administrator to set up Jira credentials in Script Properties.');
  }

  const text = (event.message?.text || '').trim();
  const lower = text.toLowerCase();
  const name = event.user?.displayName || 'there';

  const props = PropertiesService.getUserProperties();

  /* ===============================
     INCIDENT CREATION FLOW (Multi-Step)
     =============================== */

  // Step 1: waiting for summary
  if (props.getProperty('awaitingIncidentSummary') === 'true') {
    props.setProperty('incidentSummary', text);
    props.deleteProperty('awaitingIncidentSummary');
    props.setProperty('awaitingIncidentPriority', 'true');
    return buildPromptCard('Priority Required', 'Please enter priority:', ['High', 'Critical']);
  }

  // Step 2: waiting for priority
  if (props.getProperty('awaitingIncidentPriority') === 'true') {
    if (!['high', 'critical'].includes(lower)) {
      return buildPromptCard('Invalid Priority', 'Please enter a valid priority:', ['High', 'Critical']);
    }
    props.setProperty('incidentPriority', lower);
    props.deleteProperty('awaitingIncidentPriority');
    props.setProperty('awaitingIncidentStatus', 'true');
    return buildPromptCard('Status Required', 'Please enter incident status:', config.ALLOWED_STATUSES);
  }

  // Step 3: waiting for status
  if (props.getProperty('awaitingIncidentStatus') === 'true') {
    const statusMatch = config.ALLOWED_STATUSES.find(s => s.toLowerCase() === lower);
    if (!statusMatch) {
      return buildPromptCard('Invalid Status', 'Please enter a valid status:', config.ALLOWED_STATUSES);
    }

    const summary = props.getProperty('incidentSummary');
    const priority = props.getProperty('incidentPriority');
    
    // Clean up flow state
    props.deleteProperty('incidentSummary');
    props.deleteProperty('incidentPriority');
    props.deleteProperty('awaitingIncidentStatus');

    return createIncident(summary, priority, statusMatch, config);
  }

  /* ===============================
     COMMANDS
     =============================== */

  if (!lower || ['hi', 'hii', 'hello', 'help'].includes(lower)) {
    return buildWelcomeCard(name, config);
  }

  if (lower === 'projects') {
    return listJsmProjects(config);
  }

  if (lower === 'issues' || lower === 'incidents') {
    return listIncidents(config);
  }

  if (lower === 'create incident') {
    props.setProperty('awaitingIncidentSummary', 'true');
    return buildPromptCard('Create Incident', 'Please enter the incident summary:', []);
  }

  /* ===============================
     ASK-ME-ANYTHING FALLBACK
     =============================== */

  return answerGeneralQuestion(text, config);
}

/* ===============================
   CARD BUILDERS
   =============================== */

function buildWelcomeCard(name, config) {
  return {
    cardsV2: [{
      cardId: 'welcomeCard',
      card: {
        header: {
          title: '🤖 AIOPS Bot',
          subtitle: 'Your Jira Incident Assistant',
          imageUrl: config.BOT_AVATAR_URL,
          imageType: 'CIRCLE'
        },
        sections: [{
          header: 'Welcome!',
          widgets: [
            {
              decoratedText: {
                topLabel: 'Greeting',
                text: `Hi ${name}! I'm here to help you manage Jira incidents.`
              }
            },
            { divider: {} },
            {
              decoratedText: {
                topLabel: 'Available Commands',
                text: '• <b>projects</b> - List JSM projects\n• <b>issues</b> - View high/critical incidents\n• <b>create incident</b> - Start incident creation flow'
              }
            },
            { divider: {} },
            {
              decoratedText: {
                topLabel: 'Ask Questions',
                text: 'You can also ask me questions like:\n"What is an incident?" or "How do I create an incident?"'
              }
            }
          ]
        }]
      }
    }]
  };
}

function buildPromptCard(title, message, options) {
  const widgets = [
    {
      decoratedText: {
        text: message
      }
    }
  ];

  if (options.length > 0) {
    widgets.push({ divider: {} });
    widgets.push({
      decoratedText: {
        topLabel: 'Valid Options',
        text: options.map(opt => `• ${opt}`).join('\n')
      }
    });
  }

  return {
    cardsV2: [{
      cardId: 'promptCard',
      card: {
        header: {
          title: title,
          imageUrl: getConfig().BOT_AVATAR_URL,
          imageType: 'CIRCLE'
        },
        sections: [{ widgets: widgets }]
      }
    }]
  };
}

function buildErrorCard(title, message) {
  return {
    cardsV2: [{
      cardId: 'errorCard',
      card: {
        header: {
          title: '⚠️ ' + title,
          imageUrl: getConfig().BOT_AVATAR_URL,
          imageType: 'CIRCLE'
        },
        sections: [{
          widgets: [{
            decoratedText: {
              text: message
            }
          }]
        }]
      }
    }]
  };
}

/* ===============================
   LIST JSM PROJECTS
   =============================== */

function listJsmProjects(config) {
  try {
    const auth = Utilities.base64Encode(`${config.JIRA_EMAIL}:${config.JIRA_API_TOKEN}`);
    const url = `${config.JIRA_BASE_URL}/rest/api/3/project/search?type=service_desk`;

    const res = UrlFetchApp.fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
      muteHttpExceptions: true
    });

    if (res.getResponseCode() !== 200) {
      return buildErrorCard('API Error', 'Failed to fetch projects from Jira.');
    }

    const projects = JSON.parse(res.getContentText()).values || [];

    if (projects.length === 0) {
      return buildErrorCard('No Projects', 'No JSM projects found.');
    }

    const widgets = projects.map(p => ({
      decoratedText: {
        topLabel: p.name,
        text: `Key: <b>${p.key}</b>`,
        startIcon: { knownIcon: 'BOOKMARK' }
      }
    }));

    return {
      cardsV2: [{
        cardId: 'projectsCard',
        card: {
          header: {
            title: '📋 JSM Projects',
            subtitle: `${projects.length} project(s) found`,
            imageUrl: config.BOT_AVATAR_URL,
            imageType: 'CIRCLE'
          },
          sections: [{ widgets: widgets }]
        }
      }]
    };
  } catch (error) {
    return buildErrorCard('Error', 'An error occurred while fetching projects.');
  }
}

/* ===============================
   LIST HIGH / CRITICAL INCIDENTS
   =============================== */

function listIncidents(config) {
  try {
    const auth = Utilities.base64Encode(`${config.JIRA_EMAIL}:${config.JIRA_API_TOKEN}`);
    const url = `${config.JIRA_BASE_URL}/rest/api/3/search`;

    const payload = {
      jql:
        `project = ${config.JSM_PROJECT_KEY} ` +
        `AND issuetype = ${config.INCIDENT_ISSUE_TYPE_ID} ` +
        `AND priority IN (Highest, High) ` +
        `ORDER BY priority DESC, updated DESC`,
      fields: ['summary', 'priority', 'status'],
      maxResults: 50
    };

    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      headers: { Authorization: `Basic ${auth}` },
      muteHttpExceptions: true
    });

    if (res.getResponseCode() !== 200) {
      return buildErrorCard('API Error', 'Failed to fetch incidents from Jira.');
    }

    const issues = JSON.parse(res.getContentText()).issues || [];

    if (issues.length === 0) {
      return {
        cardsV2: [{
          cardId: 'noIncidentsCard',
          card: {
            header: {
              title: '✅ No Critical Incidents',
              subtitle: 'All clear!',
              imageUrl: config.BOT_AVATAR_URL,
              imageType: 'CIRCLE'
            },
            sections: [{
              widgets: [{
                decoratedText: {
                  text: 'No high or critical incidents found.'
                }
              }]
            }]
          }
        }]
      };
    }

    const widgets = [];
    issues.forEach((issue, index) => {
      if (index > 0) widgets.push({ divider: {} });
      
      widgets.push({
        decoratedText: {
          topLabel: issue.key,
          text: `<b>${issue.fields.summary}</b>`,
          startIcon: { knownIcon: 'STAR' }
        }
      });
      widgets.push({
        decoratedText: {
          text: `Priority: <b>${issue.fields.priority.name}</b> | Status: <b>${issue.fields.status.name}</b>`
        }
      });
      widgets.push({
        buttonList: {
          buttons: [{
            text: 'View in Jira',
            onClick: {
              openLink: {
                url: `${config.JIRA_BASE_URL}/browse/${issue.key}`
              }
            }
          }]
        }
      });
    });

    return {
      cardsV2: [{
        cardId: 'incidentsCard',
        card: {
          header: {
            title: '🚨 High & Critical Incidents',
            subtitle: `${issues.length} incident(s) found`,
            imageUrl: config.BOT_AVATAR_URL,
            imageType: 'CIRCLE'
          },
          sections: [{ widgets: widgets }]
        }
      }]
    };
  } catch (error) {
    return buildErrorCard('Error', 'An error occurred while fetching incidents.');
  }
}

/* ===============================
   CREATE INCIDENT
   =============================== */

function createIncident(summary, priorityInput, status, config) {
  try {
    const auth = Utilities.base64Encode(`${config.JIRA_EMAIL}:${config.JIRA_API_TOKEN}`);
    const url = `${config.JIRA_BASE_URL}/rest/api/3/issue`;

    const PRIORITY = priorityInput === 'critical' ? 'Highest' : 'High';

    const payload = {
      fields: {
        project: { key: config.JSM_PROJECT_KEY },
        summary: summary,
        issuetype: { id: config.INCIDENT_ISSUE_TYPE_ID },
        priority: { name: PRIORITY }
      }
    };

    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      headers: { Authorization: `Basic ${auth}` },
      muteHttpExceptions: true
    });

    const code = res.getResponseCode();
    const body = res.getContentText();

    if (code !== 201) {
      return buildErrorCard('Creation Failed', `Failed to create incident. Status: ${code}`);
    }

    const data = JSON.parse(body);
    const issueKey = data.key;

    return {
      cardsV2: [{
        cardId: 'incidentCreatedCard',
        card: {
          header: {
            title: '🚨 INCIDENT CREATED',
            subtitle: 'Alert: New incident requires attention',
            imageUrl: config.BOT_AVATAR_URL,
            imageType: 'CIRCLE'
          },
          sections: [{
            widgets: [
              {
                decoratedText: {
                  topLabel: 'Project',
                  text: `<b>${config.JSM_PROJECT_KEY}</b>`,
                  startIcon: { knownIcon: 'BOOKMARK' }
                }
              },
              {
                decoratedText: {
                  topLabel: 'Incident Key',
                  text: `<b>${issueKey}</b>`,
                  startIcon: { knownIcon: 'TICKET' }
                }
              },
              {
                decoratedText: {
                  topLabel: 'Summary',
                  text: summary
                }
              },
              {
                decoratedText: {
                  topLabel: 'Priority',
                  text: `<b>${PRIORITY}</b>`,
                  startIcon: { knownIcon: 'STAR' }
                }
              },
              {
                decoratedText: {
                  topLabel: 'Status (User Entered)',
                  text: `<b>${status}</b>`,
                  startIcon: { knownIcon: 'DESCRIPTION' }
                }
              },
              { divider: {} },
              {
                decoratedText: {
                  text: '⚠️ <b>Everyone in this space please coordinate on this incident.</b>'
                }
              },
              {
                buttonList: {
                  buttons: [{
                    text: 'Open in Jira',
                    onClick: {
                      openLink: {
                        url: `${config.JIRA_BASE_URL}/browse/${issueKey}`
                      }
                    }
                  }]
                }
              }
            ]
          }]
        }
      }]
    };
  } catch (error) {
    return buildErrorCard('Error', 'An error occurred while creating the incident.');
  }
}

/* ===============================
   ASK-ME-ANYTHING (FAQ / Q&A)
   =============================== */

function answerGeneralQuestion(question, config) {
  const q = question.toLowerCase();

  const faq = [
    {
      match: ['what is an incident', 'define incident', 'incident definition'],
      title: 'What is an Incident?',
      answer: 'An <b>Incident</b> is an unplanned interruption to a service or a reduction in service quality that requires immediate attention.'
    },
    {
      match: ['how to create incident', 'create incident', 'new incident'],
      title: 'How to Create an Incident',
      answer: 'Type <b>create incident</b> and I will guide you through the process step by step.'
    },
    {
      match: ['critical incident', 'what is critical', 'critical priority'],
      title: 'Critical Incidents',
      answer: 'A <b>Critical</b> incident usually means a production outage or severe business impact requiring immediate response.'
    },
    {
      match: ['high priority', 'what is high', 'high incident'],
      title: 'High Priority Incidents',
      answer: 'A <b>High</b> priority incident is a significant issue that impacts service but may not be a complete outage.'
    },
    {
      match: ['jira portal', 'service desk', 'portal url', 'jira url'],
      title: 'Jira Service Management Portal',
      answer: `Access the portal at:\n<b>${config.JIRA_BASE_URL}/servicedesk</b>`
    },
    {
      match: ['list projects', 'show projects', 'view projects'],
      title: 'List Projects',
      answer: 'Type <b>projects</b> to see all Jira Service Management projects.'
    },
    {
      match: ['list incidents', 'show incidents', 'view incidents', 'list issues'],
      title: 'List Incidents',
      answer: 'Type <b>issues</b> or <b>incidents</b> to see all high and critical priority incidents.'
    },
    {
      match: ['commands', 'what can you do', 'help', 'capabilities'],
      title: 'Available Commands',
      answer: 'I can help with:\n• <b>projects</b> - List JSM projects\n• <b>issues</b> - View incidents\n• <b>create incident</b> - Create new incident\n\nYou can also ask me questions!'
    }
  ];

  for (const item of faq) {
    if (item.match.some(m => q.includes(m))) {
      return {
        cardsV2: [{
          cardId: 'faqCard',
          card: {
            header: {
              title: '💡 ' + item.title,
              imageUrl: config.BOT_AVATAR_URL,
              imageType: 'CIRCLE'
            },
            sections: [{
              widgets: [{
                decoratedText: {
                  text: item.answer
                }
              }]
            }]
          }
        }]
      };
    }
  }

  // Default fallback
  return {
    cardsV2: [{
      cardId: 'defaultCard',
      card: {
        header: {
          title: '🤔 Question Received',
          imageUrl: config.BOT_AVATAR_URL,
          imageType: 'CIRCLE'
        },
        sections: [{
          widgets: [
            {
              decoratedText: {
                topLabel: 'Your Question',
                text: question
              }
            },
            { divider: {} },
            {
              decoratedText: {
                text: 'I\'m not sure how to answer that. Try:\n• <b>help</b> - See available commands\n• <b>projects</b> - List projects\n• <b>issues</b> - View incidents\n• <b>create incident</b> - Create new incident'
              }
            }
          ]
        }]
      }
    }]
  };
}

/* ===============================
   END OF CODE
   =============================== */
