import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../../services/api";
import type { Product } from "../../types";

export default function StepProduct({ planId, products, onChange }: { planId: string; products: Product[]; onChange: () => void }) {
  const [draft, setDraft] = useState({ name: "", price: 0, cost: 0, description: "", usp: "" });

  async function addProduct() {
    if (!draft.name.trim()) return;
    await api.post(`/plans/${planId}/products`, draft);
    setDraft({ name: "", price: 0, cost: 0, description: "", usp: "" });
    onChange();
  }

  async function deleteProduct(id: string) {
    await api.delete(`/plans/${planId}/products/${id}`);
    onChange();
  }

  return (
    <div>
      <div className="space-y-3">
        {products.map((p) => {
          const margin = p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(1) : "0";
          return (
            <div key={p.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-ink/50 dark:text-paper/50">
                  Price ${p.price.toFixed(2)} · Cost ${p.cost.toFixed(2)} · Margin {margin}%
                </div>
              </div>
              <button onClick={() => deleteProduct(p.id)} className="text-ink/30 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="card mt-4">
        <h4 className="font-medium">Add a product or service</h4>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="field-label">Name</label>
            <input className="field-input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          </div>
          <div>
            <label className="field-label">Price ($)</label>
            <input type="number" className="field-input" value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="field-label">Cost ($)</label>
            <input type="number" className="field-input" value={draft.cost} onChange={(e) => setDraft((d) => ({ ...d, cost: Number(e.target.value) }))} />
          </div>
        </div>
        <div className="mt-4">
          <label className="field-label">Unique selling proposition</label>
          <input className="field-input" value={draft.usp} onChange={(e) => setDraft((d) => ({ ...d, usp: e.target.value }))} />
        </div>
        {draft.price > 0 && (
          <p className="mt-2 text-xs text-ink/50 dark:text-paper/50">
            Margin: {(((draft.price - draft.cost) / draft.price) * 100).toFixed(1)}%
          </p>
        )}
        <button onClick={addProduct} className="btn-secondary mt-4">
          <Plus size={14} /> Add product
        </button>
      </div>
    </div>
  );
}
