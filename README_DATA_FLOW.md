# Data Flow & Modification Guide

This guide explains how data is structured in the Pharmaceutical Inventory application and how to modify it (e.g., updating tables or adding new fields).

## 1. Data Structure Overview

The application uses a centralized state management approach (Context API + useReducer). The main data types are defined in `src/types/index.ts`.

*   **Drug (Master Data)**: Represents an inventory item.
    *   Fields: `id`, `namaBarang`, `stokAwal`, `satuan`, `harga`, etc.
*   **Transaction (Pemasukan/Pengeluaran)**: Represents a stock movement.
    *   Fields: `id`, `drugId`, `quantity`, `date`, `batchNumber`, `expiryDate`, `price`, etc.

## 2. How Data Flows

1.  **State Initialization**: `AppState` in `src/context/AppContext.tsx` holds the global state (`drugs`, `transactions`).
2.  **Persistence**: Data is saved/loaded from `localStorage` automatically via hooks in `AppContext`.
3.  **Updates**: Components verify inputs and dispatch actions (e.g., `ADD_DRUG`, `ADD_TRANSACTION`) to the reducer.
4.  **UI Updates**: Components subscribe to `useApp()` to read the state and re-render when data changes.

## 3. How to Add New Fields

If you want to add a new field (e.g., "Supplier Phone Number") to an existing table (like `MasterData` or `Pemasukan`):

### Step 1: Update Types
Open `src/types/index.ts` and add the field to the relevant interface.
```typescript
// Example: Adding phone to Transaction
export interface Transaction {
  // ... existing fields
  supplierPhone?: string; // Add this
}

export interface TransactionFormData {
  // ... existing fields
  supplierPhone: string; // Add this for the form state
}
```

### Step 2: Update Page State (e.g., `src/pages/Pemasukan.tsx`)
1.  **Initial State**: Add the field to the `useState` initialization.
    ```typescript
    const [formData, setFormData] = useState<TransactionFormData>({
      // ...
      supplierPhone: '',
    });
    ```
2.  **Validation**: Add checks in `validateForm` if the field is required.
3.  **Submit Handler**: Include the field in the payload object in `handleSubmit`.
    ```typescript
    const transaction: Transaction = {
      // ...
      supplierPhone: formData.supplierPhone,
    };
    ```
4.  **Reset Handlers**: Clear the field in `handleOpenModal` and `handleCloseModal`.

### Step 3: Update UI
1.  **Form**: Add the input element in the Modal form (inside the `return` JSX).
    ```tsx
    <input
      value={formData.supplierPhone}
      onChange={(e) => setFormData({...formData, supplierPhone: e.target.value})}
    />
    ```
2.  **Table**: Add a `<th>` in the table header and a `<td>` in the table body to display the new data.

## 4. How to Add a New Table

To add a completely new entity (e.g., "Suppliers"):

1.  **Define Type**: Create `Supplier` interface in `src/types/index.ts`.
2.  **Update AppState**: Add `suppliers: Supplier[]` to `AppState` interface in `index.ts`.
3.  **Update Actions**: Add `ADD_SUPPLIER`, `UPDATE_SUPPLIER` actions to `AppAction`.
4.  **Update Reducer**: Handle these actions in `src/context/reducer.ts` (or `AppContext.tsx`).
5.  **Create Page**: Create `src/pages/Suppliers.tsx` (copy `MasterData.tsx` as a template).
6.  **Add Route**: Register the new page in `src/App.tsx`.

## 5. Tips
*   **Safety**: Always verify `validateForm` logic to prevent bad data.
*   **Consistency**: Ensure the `name` attributes or state keys match your Types.
*   **Auto-fill**: You can use `onChange` handlers to auto-fill fields based on other selections (like `Satuan` in Pemasukan).
