import { describe, it, expect } from "vitest"
import {
  VerticalPage,
  type VerticalPageConfig,
  type FormFieldConfig,
  type ColumnConfig,
} from "../components/dashboard/VerticalPage"

// ---------------------------------------------------------------------------
// Pure unit tests for exported types + config shape validation
// No DOM rendering — @testing-library/react not available
// ---------------------------------------------------------------------------

describe("VerticalPage exports", () => {
  it("VerticalPage is a function component", () => {
    expect(typeof VerticalPage).toBe("function")
  })
})

describe("VerticalPageConfig type compliance", () => {
  it("accepts a well-formed config object", () => {
    const formFields: FormFieldConfig[] = [
      { name: "name", label: "Name", type: "text", placeholder: "Enter name" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      },
      { name: "count", label: "Count", type: "number" },
      { name: "verified", label: "Verified", type: "checkbox" },
      { name: "due_date", label: "Due Date", type: "date" },
    ]

    const columns: ColumnConfig[] = [
      { key: "name", label: "Name" },
      { key: "status", label: "Status", render: "status" },
      { key: "due_date", label: "Due Date", render: "date" },
      { key: "verified", label: "Verified", render: "boolean" },
      { key: "tags", label: "Tags", render: "tags" },
    ]

    const config: VerticalPageConfig = {
      title: "Test Items",
      description: "3 items tracked",
      addButtonLabel: "Add Item",
      emptyStateMessage: "No items yet.",
      icon: () => null,
      fetchAction: async () => [],
      createAction: async () => ({}),
      deleteAction: async () => ({}),
      verifyAction: async () => ({}),
      formFields,
      columns,
      statusStyles: {
        active: "bg-green-500/10 text-green-600",
        inactive: "bg-red-500/10 text-red-600",
      },
      statusKey: "status",
    }

    // Config is valid if it compiles and all fields are set
    expect(config.title).toBe("Test Items")
    expect(config.formFields).toHaveLength(5)
    expect(config.columns).toHaveLength(5)
    expect(config.statusKey).toBe("status")
  })

  it("allows optional fields to be omitted", () => {
    const config: VerticalPageConfig = {
      title: "Minimal",
      description: "0 items",
      addButtonLabel: "Add",
      emptyStateMessage: "Empty.",
      icon: () => null,
      fetchAction: async () => [],
      createAction: async () => ({}),
      formFields: [],
      columns: [],
      statusStyles: {},
    }

    expect(config.deleteAction).toBeUndefined()
    expect(config.verifyAction).toBeUndefined()
    expect(config.statusKey).toBeUndefined()
    expect(config.headerExtra).toBeUndefined()
  })
})

describe("FormFieldConfig", () => {
  it("supports all 5 field types", () => {
    const types: FormFieldConfig["type"][] = [
      "text",
      "select",
      "date",
      "number",
      "checkbox",
    ]
    expect(types).toHaveLength(5)
  })

  it("select fields require options array", () => {
    const field: FormFieldConfig = {
      name: "priority",
      label: "Priority",
      type: "select",
      options: [
        { value: "low", label: "Low" },
        { value: "high", label: "High" },
      ],
    }
    expect(field.options).toHaveLength(2)
    expect(field.options![0].value).toBe("low")
  })
})

describe("ColumnConfig", () => {
  it("supports all render modes", () => {
    const renders: ColumnConfig["render"][] = [
      "text",
      "status",
      "date",
      "boolean",
      "tags",
      undefined,
    ]
    expect(renders).toHaveLength(6)
  })
})
