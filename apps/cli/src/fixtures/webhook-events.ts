/**
 * Webhook event type definitions and realistic sample payloads for testing.
 * These are used by `ghl webhooks trigger` and `ghl webhooks list`.
 */

export interface WebhookEventDef {
    type: string;
    description: string;
    category: string;
    samplePayload: Record<string, unknown>;
}

function ts(minutesAgo = 0): string {
    return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

const TEST_LOCATION_ID = 'loc_test_abc123def456';
const TEST_COMPANY_ID = 'comp_test_xyz789ghi012';
const TEST_CONTACT_ID = 'cont_test_jkl345mno678';
const TEST_USER_ID = 'user_test_pqr901stu234';
const TEST_APP_ID = 'app_test_uvw567xyz890';

export const WEBHOOK_EVENTS: WebhookEventDef[] = [
    // ── Contact Events ──
    {
        type: 'ContactCreate',
        description: 'Fired when a new contact is created',
        category: 'Contacts',
        samplePayload: {
            type: 'ContactCreate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID,
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane.doe@example.com',
                phone: '+15551234567',
                tags: ['new-lead'],
                source: 'form',
                dateAdded: ts()
            }
        }
    },
    {
        type: 'ContactUpdate',
        description: 'Fired when a contact is updated',
        category: 'Contacts',
        samplePayload: {
            type: 'ContactUpdate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID,
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                phone: '+15551234567',
                tags: ['new-lead', 'qualified'],
                dateUpdated: ts()
            }
        }
    },
    {
        type: 'ContactDelete',
        description: 'Fired when a contact is deleted',
        category: 'Contacts',
        samplePayload: {
            type: 'ContactDelete',
            locationId: TEST_LOCATION_ID,
            body: {
                id: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID
            }
        }
    },
    {
        type: 'ContactDndUpdate',
        description: 'Fired when a contact DND status is updated',
        category: 'Contacts',
        samplePayload: {
            type: 'ContactDndUpdate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID,
                dnd: true,
                dndSettings: {
                    Call: { status: 'active' },
                    Email: { status: 'inactive' },
                    SMS: { status: 'active' }
                }
            }
        }
    },
    {
        type: 'ContactTagUpdate',
        description: 'Fired when contact tags are updated',
        category: 'Contacts',
        samplePayload: {
            type: 'ContactTagUpdate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID,
                tags: ['vip', 'returning-customer'],
                tagsAdded: ['vip'],
                tagsRemoved: ['new-lead']
            }
        }
    },
    {
        type: 'NoteCreate',
        description: 'Fired when a note is added to a contact',
        category: 'Contacts',
        samplePayload: {
            type: 'NoteCreate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'note_test_001',
                contactId: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID,
                body: 'Follow up scheduled for next week.',
                userId: TEST_USER_ID,
                dateAdded: ts()
            }
        }
    },
    {
        type: 'NoteUpdate',
        description: 'Fired when a contact note is updated',
        category: 'Contacts',
        samplePayload: {
            type: 'NoteUpdate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'note_test_001',
                contactId: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID,
                body: 'Follow up completed. Client interested.',
                userId: TEST_USER_ID,
                dateUpdated: ts()
            }
        }
    },
    {
        type: 'NoteDelete',
        description: 'Fired when a contact note is deleted',
        category: 'Contacts',
        samplePayload: {
            type: 'NoteDelete',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'note_test_001',
                contactId: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID
            }
        }
    },
    {
        type: 'TaskCreate',
        description: 'Fired when a task is created for a contact',
        category: 'Contacts',
        samplePayload: {
            type: 'TaskCreate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'task_test_001',
                contactId: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID,
                title: 'Send proposal',
                description: 'Send the project proposal to the client.',
                assignedTo: TEST_USER_ID,
                dueDate: ts(-60 * 24), // tomorrow
                status: 'pending',
                dateAdded: ts()
            }
        }
    },
    {
        type: 'TaskComplete',
        description: 'Fired when a contact task is completed',
        category: 'Contacts',
        samplePayload: {
            type: 'TaskComplete',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'task_test_001',
                contactId: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID,
                title: 'Send proposal',
                status: 'completed',
                completedAt: ts()
            }
        }
    },

    // ── Appointment Events ──
    {
        type: 'AppointmentCreate',
        description: 'Fired when an appointment is booked',
        category: 'Appointments',
        samplePayload: {
            type: 'AppointmentCreate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'apt_test_001',
                contactId: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID,
                calendarId: 'cal_test_001',
                title: 'Discovery Call',
                startTime: ts(-60), // 1 hour from now
                endTime: ts(-90), // 1.5 hours from now
                status: 'confirmed',
                assignedUserId: TEST_USER_ID,
                dateAdded: ts()
            }
        }
    },
    {
        type: 'AppointmentUpdate',
        description: 'Fired when an appointment is modified',
        category: 'Appointments',
        samplePayload: {
            type: 'AppointmentUpdate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'apt_test_001',
                contactId: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID,
                calendarId: 'cal_test_001',
                title: 'Discovery Call (Rescheduled)',
                startTime: ts(-120),
                endTime: ts(-150),
                status: 'confirmed',
                dateUpdated: ts()
            }
        }
    },
    {
        type: 'AppointmentDelete',
        description: 'Fired when an appointment is cancelled/deleted',
        category: 'Appointments',
        samplePayload: {
            type: 'AppointmentDelete',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'apt_test_001',
                contactId: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID
            }
        }
    },

    // ── Opportunity Events ──
    {
        type: 'OpportunityCreate',
        description: 'Fired when a pipeline opportunity is created',
        category: 'Opportunities',
        samplePayload: {
            type: 'OpportunityCreate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'opp_test_001',
                locationId: TEST_LOCATION_ID,
                contactId: TEST_CONTACT_ID,
                pipelineId: 'pipe_test_001',
                pipelineStageId: 'stage_test_001',
                name: 'Website Redesign Project',
                monetaryValue: 5000,
                status: 'open',
                source: 'manual',
                dateAdded: ts()
            }
        }
    },
    {
        type: 'OpportunityUpdate',
        description: 'Fired when a pipeline opportunity is updated',
        category: 'Opportunities',
        samplePayload: {
            type: 'OpportunityUpdate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'opp_test_001',
                locationId: TEST_LOCATION_ID,
                contactId: TEST_CONTACT_ID,
                pipelineId: 'pipe_test_001',
                pipelineStageId: 'stage_test_002',
                name: 'Website Redesign Project',
                monetaryValue: 7500,
                status: 'open',
                dateUpdated: ts()
            }
        }
    },
    {
        type: 'OpportunityDelete',
        description: 'Fired when a pipeline opportunity is deleted',
        category: 'Opportunities',
        samplePayload: {
            type: 'OpportunityDelete',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'opp_test_001',
                locationId: TEST_LOCATION_ID
            }
        }
    },
    {
        type: 'OpportunityStageUpdate',
        description: 'Fired when an opportunity moves pipeline stages',
        category: 'Opportunities',
        samplePayload: {
            type: 'OpportunityStageUpdate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'opp_test_001',
                locationId: TEST_LOCATION_ID,
                previousStageId: 'stage_test_001',
                currentStageId: 'stage_test_002',
                pipelineId: 'pipe_test_001',
                dateUpdated: ts()
            }
        }
    },
    {
        type: 'OpportunityStatusUpdate',
        description: 'Fired when opportunity status changes (won/lost/open)',
        category: 'Opportunities',
        samplePayload: {
            type: 'OpportunityStatusUpdate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'opp_test_001',
                locationId: TEST_LOCATION_ID,
                previousStatus: 'open',
                currentStatus: 'won',
                dateUpdated: ts()
            }
        }
    },
    {
        type: 'OpportunityMonetaryValueUpdate',
        description: 'Fired when opportunity monetary value changes',
        category: 'Opportunities',
        samplePayload: {
            type: 'OpportunityMonetaryValueUpdate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'opp_test_001',
                locationId: TEST_LOCATION_ID,
                previousMonetaryValue: 5000,
                currentMonetaryValue: 12000,
                dateUpdated: ts()
            }
        }
    },

    // ── Conversation Events ──
    {
        type: 'ConversationUnreadUpdate',
        description: 'Fired when unread status changes on a conversation',
        category: 'Conversations',
        samplePayload: {
            type: 'ConversationUnreadUpdate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'conv_test_001',
                locationId: TEST_LOCATION_ID,
                contactId: TEST_CONTACT_ID,
                unreadCount: 3,
                dateUpdated: ts()
            }
        }
    },
    {
        type: 'InboundMessage',
        description: 'Fired when an inbound message is received',
        category: 'Conversations',
        samplePayload: {
            type: 'InboundMessage',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'msg_test_001',
                conversationId: 'conv_test_001',
                contactId: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID,
                type: 'SMS',
                direction: 'inbound',
                body: 'Hi, I wanted to follow up on our meeting.',
                dateAdded: ts()
            }
        }
    },
    {
        type: 'OutboundMessage',
        description: 'Fired when an outbound message is sent',
        category: 'Conversations',
        samplePayload: {
            type: 'OutboundMessage',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'msg_test_002',
                conversationId: 'conv_test_001',
                contactId: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID,
                type: 'SMS',
                direction: 'outbound',
                body: 'Thanks for reaching out! Let me check on that.',
                userId: TEST_USER_ID,
                dateAdded: ts()
            }
        }
    },

    // ── Form Events ──
    {
        type: 'FormSubmission',
        description: 'Fired when a form is submitted',
        category: 'Forms',
        samplePayload: {
            type: 'FormSubmission',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'sub_test_001',
                formId: 'form_test_001',
                contactId: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID,
                name: 'Contact Form',
                data: {
                    full_name: 'Jane Doe',
                    email: 'jane.doe@example.com',
                    phone: '+15551234567',
                    message: 'I am interested in your services.'
                },
                dateAdded: ts()
            }
        }
    },

    // ── Invoice Events ──
    {
        type: 'InvoiceCreate',
        description: 'Fired when an invoice is created',
        category: 'Invoices',
        samplePayload: {
            type: 'InvoiceCreate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'inv_test_001',
                locationId: TEST_LOCATION_ID,
                contactId: TEST_CONTACT_ID,
                name: 'Website Design - Phase 1',
                amount: 2500,
                currency: 'USD',
                status: 'draft',
                dueDate: ts(-60 * 24 * 7),
                dateAdded: ts()
            }
        }
    },
    {
        type: 'InvoiceUpdate',
        description: 'Fired when an invoice is updated',
        category: 'Invoices',
        samplePayload: {
            type: 'InvoiceUpdate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'inv_test_001',
                locationId: TEST_LOCATION_ID,
                contactId: TEST_CONTACT_ID,
                name: 'Website Design - Phase 1',
                amount: 2500,
                currency: 'USD',
                status: 'sent',
                dateUpdated: ts()
            }
        }
    },
    {
        type: 'InvoiceDelete',
        description: 'Fired when an invoice is deleted',
        category: 'Invoices',
        samplePayload: {
            type: 'InvoiceDelete',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'inv_test_001',
                locationId: TEST_LOCATION_ID
            }
        }
    },
    {
        type: 'InvoicePaymentReceived',
        description: 'Fired when payment is received for an invoice',
        category: 'Invoices',
        samplePayload: {
            type: 'InvoicePaymentReceived',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'inv_test_001',
                locationId: TEST_LOCATION_ID,
                contactId: TEST_CONTACT_ID,
                amountPaid: 2500,
                currency: 'USD',
                paymentMethod: 'credit_card',
                datePaid: ts()
            }
        }
    },

    // ── Order Events ──
    {
        type: 'OrderCreate',
        description: 'Fired when a new order is placed',
        category: 'Orders',
        samplePayload: {
            type: 'OrderCreate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'order_test_001',
                locationId: TEST_LOCATION_ID,
                contactId: TEST_CONTACT_ID,
                total: 149.99,
                currency: 'USD',
                status: 'pending',
                items: [
                    { name: 'Consultation Package', quantity: 1, price: 149.99 }
                ],
                dateAdded: ts()
            }
        }
    },
    {
        type: 'OrderStatusUpdate',
        description: 'Fired when order status changes',
        category: 'Orders',
        samplePayload: {
            type: 'OrderStatusUpdate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'order_test_001',
                locationId: TEST_LOCATION_ID,
                previousStatus: 'pending',
                currentStatus: 'completed',
                dateUpdated: ts()
            }
        }
    },

    // ── App Lifecycle Events ──
    {
        type: 'INSTALL',
        description: 'Fired when your app is installed at a location/company',
        category: 'App Lifecycle',
        samplePayload: {
            type: 'INSTALL',
            appId: TEST_APP_ID,
            versionId: 'ver_001',
            installType: 'location',
            locationId: TEST_LOCATION_ID,
            companyId: TEST_COMPANY_ID,
            userId: TEST_USER_ID,
            companyName: 'Acme Agency',
            isWhitelabelCompany: false,
            planId: 'plan_free',
            trial: {},
            timestamp: ts()
        }
    },
    {
        type: 'UNINSTALL',
        description: 'Fired when your app is uninstalled',
        category: 'App Lifecycle',
        samplePayload: {
            type: 'UNINSTALL',
            appId: TEST_APP_ID,
            companyId: TEST_COMPANY_ID,
            locationId: TEST_LOCATION_ID,
            timestamp: ts()
        }
    },

    // ── Course Events ──
    {
        type: 'CourseCompleted',
        description: 'Fired when a student completes a course',
        category: 'Courses',
        samplePayload: {
            type: 'CourseCompleted',
            locationId: TEST_LOCATION_ID,
            body: {
                contactId: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID,
                courseId: 'course_test_001',
                courseName: 'Onboarding 101',
                completedAt: ts()
            }
        }
    },

    // ── Membership Events ──
    {
        type: 'MembershipSignup',
        description: 'Fired when a contact signs up for a membership',
        category: 'Memberships',
        samplePayload: {
            type: 'MembershipSignup',
            locationId: TEST_LOCATION_ID,
            body: {
                contactId: TEST_CONTACT_ID,
                locationId: TEST_LOCATION_ID,
                offerId: 'offer_test_001',
                offerName: 'Premium Membership',
                dateAdded: ts()
            }
        }
    },

    // ── Payment Events ──
    {
        type: 'PaymentReceived',
        description: 'Fired when a payment is received',
        category: 'Payments',
        samplePayload: {
            type: 'PaymentReceived',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'pay_test_001',
                locationId: TEST_LOCATION_ID,
                contactId: TEST_CONTACT_ID,
                amount: 99.99,
                currency: 'USD',
                source: 'stripe',
                status: 'succeeded',
                dateAdded: ts()
            }
        }
    },

    // ── Workflow Events ──
    {
        type: 'WorkflowCreate',
        description: 'Fired when a workflow is created',
        category: 'Workflows',
        samplePayload: {
            type: 'WorkflowCreate',
            locationId: TEST_LOCATION_ID,
            body: {
                id: 'wf_test_001',
                locationId: TEST_LOCATION_ID,
                name: 'New Lead Follow-Up',
                status: 'draft',
                dateAdded: ts()
            }
        }
    }
];

/**
 * Get the map of event type → event definition.
 */
export function getEventMap(): Map<string, WebhookEventDef> {
    const map = new Map<string, WebhookEventDef>();
    for (const e of WEBHOOK_EVENTS) {
        map.set(e.type, e);
    }
    return map;
}

/**
 * Get the list of unique categories.
 */
export function getCategories(): string[] {
    return [...new Set(WEBHOOK_EVENTS.map(e => e.category))];
}
