# UI test cases

Manual test-case specifications for the automated UI suite. Each case documents
what the automation does, so it can be executed by hand, reviewed by QA, or
traced from a defect report back to the spec that covers it.

```
tests/ui/
├── purchase-requisitions/   TC-PR-001, TC-PR-002, TC-PR-003
└── purchase-orders/         TC-PO-001
```

## Index

| ID            | Title                                            | Priority | Tag           | Automated in                                                |
| ------------- | ------------------------------------------------ | -------- | ------------- | ----------------------------------------------------------- |
| **TC-PR-001** | Create a Purchase Requisition with a single item | Critical | `@smoke`      | `purchase-requisitions/create-purchase-requisition.spec.ts` |
| **TC-PR-002** | Mark an approved Purchase Requisition completed  | Medium   | `@regression` | `purchase-requisitions/create-purchase-requisition.spec.ts` |
| **TC-PR-003** | Cancel a Purchase Requisition with a reason      | Medium   | `@regression` | `purchase-requisitions/create-purchase-requisition.spec.ts` |
| **TC-PO-001** | Create a Purchase Order from a requisition       | Critical | `@smoke`      | `purchase-orders/create-purchase-order.spec.ts`             |

## Shared preconditions

Apply to every case below unless stated otherwise.

| #   | Precondition                                                                                                |
| --- | ----------------------------------------------------------------------------------------------------------- |
| 1   | A valid Precoro user is signed in (the suite reuses a session created once by `tests/setup/auth.setup.ts`). |
| 2   | The account is configured with Location **Backoffice** and Department **Administration**.                   |
| 3   | Supplier **Apple** and Category **Tech** exist and are selectable on a document item.                       |
| 4   | The user holds permission to create, confirm, complete and cancel Purchase Requisitions.                    |
| 5   | The cookie-consent banner is dismissed (handled automatically on the login page).                           |

> **Environment note.** This account has **no approval workflow configured**, so a
> confirmed document goes straight to `Approved` rather than `Pending`. On an
> account with approvers, the expected status in step "confirm" changes.

---

## TC-PR-001 — Create a Purchase Requisition with a single item

| Field         | Value                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Module**    | Purchase Requisitions                                                                                               |
| **Type**      | Functional — positive / end-to-end                                                                                  |
| **Priority**  | Critical                                                                                                            |
| **Objective** | Verify a requisition can be created through the UI and that every submitted value persists after a full round trip. |

### Test data

| Field         | Value                                             |
| ------------- | ------------------------------------------------- |
| Delivery Date | Today, format `dd.mm.yyyy`                        |
| Location      | Backoffice                                        |
| Departments   | Administration                                    |
| Note          | Generated per run — `[e2e <id>] <lorem sentence>` |
| Item Name     | Notepad                                           |
| Quantity      | 1                                                 |
| Price         | 1000                                              |
| Supplier      | Apple                                             |
| Category      | Tech                                              |

The note is generated so each run is unique and traceable; the remaining values
are account configuration and are asserted verbatim.

### Steps

| #   | Action                                                                                                                           | Expected result                                                                                                                                                                              |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Hover the left navigation rail and click **Purchase Requisitions**                                                               | The Purchase Requisitions list opens at `/purchase/requisition`                                                                                                                              |
| 2   | Click **Create**                                                                                                                 | The create form opens at `/purchase/requisition/create/manual`                                                                                                                               |
| 3   | Enter **Delivery Date** = today; select **Location** = Backoffice, **Departments** = Administration; type the generated **Note** | All four fields accept the values and display them                                                                                                                                           |
| 4   | Click **Next Step**                                                                                                              | The document is **created and saved as Draft**, and the details page opens at `/purchase/requisition/{id}/show` with a document number and a `Draft` status badge                            |
| 5   | Click **Add New Item** and fill the row: Item Name `Notepad`, Quantity `1`, Price `1000`, Supplier `Apple`, Category `Tech`      | An editable row appears and accepts all five values                                                                                                                                          |
| 6   | Click the **checkmark** in the _Action_ column                                                                                   | The row exits edit mode and is saved                                                                                                                                                         |
| 7   | _Verify_ the item was added                                                                                                      | The items table shows one row: `Notepad`, qty `1`, price `1,000.00`, total `1,000.00`, `Apple`, `Tech`                                                                                       |
| 8   | Click **Confirm**                                                                                                                | Dialog appears: _"Are you sure you want to confirm this document?"_                                                                                                                          |
| 9   | Click **Yes**                                                                                                                    | The dialog closes and the document leaves `Draft`                                                                                                                                            |
| 10  | _Verify_ the requisition was created                                                                                             | Status badge reads **Approved**                                                                                                                                                              |
| 11  | Open the **Purchase Requisitions** list page                                                                                     | The list loads                                                                                                                                                                               |
| 12  | Find the row for the new document number and open it                                                                             | The details page for that document opens                                                                                                                                                     |
| 13  | _Verify_ every submitted value                                                                                                   | Title contains `#{number}`; status `Approved`; Location `Backoffice`; Departments `Administration`; Delivery Date = today; Note matches; item row matches step 7; **Total** = `1,000.00 EUR` |

### Postconditions

A Purchase Requisition in `Approved` status exists in the account. It is **not**
cleaned up — see _Test data hygiene_ below.

---

## TC-PR-002 — Mark an approved Purchase Requisition completed

| Field         | Value                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| **Module**    | Purchase Requisitions                                                                                   |
| **Type**      | Functional — positive, state transition                                                                 |
| **Priority**  | Medium                                                                                                  |
| **Objective** | Verify an approved requisition can be completed, and that the status survives a round trip to the list. |

**Additional precondition:** an approved Purchase Requisition exists (created by
TC-PR-001's flow, which the automation reuses as a precondition).

### Steps

| #   | Action                                                      | Expected result                                                                                                |
| --- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | Open the created Purchase Requisition                       | Details page loads; status badge reads **Approved**                                                            |
| 2   | Click the **…** (three dots) button in the top-right corner | The _More Actions_ menu opens, offering **Mark as completed** among other actions                              |
| 3   | Click **Mark as completed**                                 | Dialog appears: _"Are you sure you want to change the status of Purchase Requisition #{number} to Completed?"_ |
| 4   | Click **Yes**                                               | The dialog closes                                                                                              |
| 5   | _Verify_ the document status                                | Status badge reads **Completed**                                                                               |
| 6   | Open the **Purchase Requisitions** list page                | The list loads                                                                                                 |
| 7   | _Verify_ the status in the document's row                   | The row's status badge reads **Completed**                                                                     |

> Steps 6-7 are not redundant with step 5: they prove the change was persisted
> server-side rather than only re-rendered on the details page.

### Postconditions

The requisition is in `Completed` status and can no longer be edited.

---

## TC-PR-003 — Cancel a Purchase Requisition with a reason

| Field         | Value                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Module**    | Purchase Requisitions                                                                                                                |
| **Type**      | Functional — positive, state transition                                                                                              |
| **Priority**  | Medium                                                                                                                               |
| **Objective** | Verify a requisition can be cancelled with a mandatory reason, that the confirmation message is shown, and that the status persists. |

**Additional preconditions:**

1. An approved Purchase Requisition exists.
2. **No Purchase Order has been raised against it** — once one exists, _Cancel
   Document_ is rendered **disabled**.

### Test data

| Field               | Value                                             |
| ------------------- | ------------------------------------------------- |
| Cancellation reason | Generated per run — `[e2e <id>] <lorem sentence>` |

### Steps

| #   | Action                                                      | Expected result                                                                                                                                                                                                       |
| --- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Open the created Purchase Requisition                       | Details page loads; status badge reads **Approved**                                                                                                                                                                   |
| 2   | Click the **…** (three dots) button in the top-right corner | The _More Actions_ menu opens; **Cancel Document** is present and **enabled**                                                                                                                                         |
| 3   | Click **Cancel Document**                                   | Dialog appears: _"Are you sure you want to cancel this document? Please, leave a comment specifying the reason of the cancellation."_ with a required **Comment** field. **Yes is disabled** while the field is empty |
| 4   | Enter the generated reason in the **Comment** field         | **Yes** becomes enabled                                                                                                                                                                                               |
| 5   | Click **Yes**                                               | The dialog closes                                                                                                                                                                                                     |
| 6   | _Verify_ the confirmation message                           | Toast appears: **"The document has been canceled."**                                                                                                                                                                  |
| 7   | _Verify_ the document status                                | Status badge reads **Canceled**                                                                                                                                                                                       |
| 8   | Open the **Purchase Requisitions** list page                | The list loads                                                                                                                                                                                                        |
| 9   | _Verify_ the status in the document's row                   | The row's status badge reads **Canceled**                                                                                                                                                                             |

> The toast in step 6 auto-dismisses after a few seconds — check it immediately
> after step 5, before navigating.

### Postconditions

The requisition is in `Canceled` status. The reason is stored against the
document.

---

## TC-PO-001 — Create a Purchase Order from a requisition

| Field         | Value                                                                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Module**    | Purchase Orders                                                                                                                                                                                              |
| **Type**      | Functional — positive / end-to-end                                                                                                                                                                           |
| **Priority**  | Critical                                                                                                                                                                                                     |
| **Objective** | Verify a Purchase Order can be raised from an approved requisition, that confirming dispatches it to the supplier, and that the order carries both its own data and the link back to its source requisition. |

**Additional precondition:** an approved Purchase Requisition exists with the
item from TC-PR-001, and **no order has yet been raised against it** — the
**Create Purchase Order** button is replaced by **Add Receipt** once one has.

### Test data

| Field         | Value                                             |
| ------------- | ------------------------------------------------- |
| Payment Terms | Prepayment                                        |
| Taxes         | VAT 10% 10.00%                                    |
| Note          | Generated per run — `[e2e <id>] <lorem sentence>` |

Supplier, Location, Departments and Delivery Date are inherited from the source
requisition and are not entered here.

### Steps

| #   | Action                                                        | Expected result                                                                                                                                                |
| --- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Open the created Purchase Requisition                         | Details page loads; status **Approved**; **Create Purchase Order** is visible                                                                                  |
| 2   | Click **Create Purchase Order**                               | The order form opens at `/purchase/order/create/from_requests?purchaseRequisitionIdn={number}`, prefilled from the requisition                                 |
| 3   | Select **Payment Terms** = `Prepayment`                       | The value is selected                                                                                                                                          |
| 4   | Open **Taxes** and tick **VAT 10% 10.00%**                    | The tax is ticked (a multi-select of checkboxes, not a single-choice list)                                                                                     |
| 5   | Enter the generated **Note**                                  | The note is accepted                                                                                                                                           |
| 6   | Click **Create**                                              | The Purchase Order is created; its details page opens at `/purchase/order/{id}/show`                                                                           |
| 7   | _Verify_ the opened page and supplier state                   | Title contains the new order number; the **Supplier** block shows status **Not sent**                                                                          |
| 8   | Click **Confirm**                                             | Dialog appears: _"Are you sure you want to confirm this document?"_                                                                                            |
| 9   | Click **Yes**                                                 | The dialog closes                                                                                                                                              |
| 10  | _Verify_ the confirmation message                             | Toast appears: **"Confirmed successfully. Purchase Order has been sent to the supplier."**                                                                     |
| 11  | _Verify_ the supplier state                                   | The **Supplier** block status changes to **Sent**                                                                                                              |
| 12  | Open the **Purchase Orders** list page and open the new order | The order's details page reopens                                                                                                                               |
| 13  | _Verify_ all provided information                             | Supplier `Apple`; Payment Terms `Prepayment`; Location `Backoffice`; Departments `Administration`; Delivery Date = today; Note matches; Taxes `VAT 10% 10.00%` |
| 14  | _Verify_ the totals                                           | Net Total `1,000.00`; Total Tax `100.00`; Gross Total `1,100.00 EUR`                                                                                           |
| 15  | _Verify_ the link to the source requisition                   | The **Purchase Requisitions** block references `#{requisition number}`; supplier status is still **Sent**                                                      |

> The toast in step 10 auto-dismisses — check it immediately after step 9.
> Totals are derived, not fixed: `gross = net × (1 + tax rate)`.

### Postconditions

Need to add. I tried to find the way to clear all created data, but I couldn't.

---

## Test data hygiene

None of these cases clean up after themselves — the suite is UI-only, and there
is no UI path to delete a confirmed document. Every execution therefore leaves a
new Purchase Requisition (and, for TC-PO-001, a Purchase Order plus a real
supplier email) in the account.

Generated notes and cancellation reasons are prefixed **`[e2e ]`** so suite-created
documents can be identified and filtered.
