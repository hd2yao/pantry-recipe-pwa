import type { PantryItem } from '../../domain/types';
import { useState } from 'react';
import { buildRecipeKeyword, buildRecipeSearchUrl } from '../../domain/recipeSearch';

type RecipeSearchProps = {
  items: PantryItem[];
};

export function RecipeSearch({ items }: RecipeSearchProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <section className="empty-state" aria-labelledby="recipe-empty-title">
        <span className="empty-state__icon" aria-hidden="true">
          ◎
        </span>
        <h2 id="recipe-empty-title">先记下食材，再来找菜谱</h2>
        <p>菜谱搜索会直接使用你库存里的食材名称。</p>
      </section>
    );
  }

  const selectedItems = items.filter((item) => selectedIds.has(item.id));
  const ingredients = selectedItems.map((item) => item.name);
  const keyword = ingredients.length > 0 ? buildRecipeKeyword(ingredients) : null;

  const toggleItem = (itemId: string) => {
    setCopyStatus(null);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const copyKeyword = async () => {
    if (!keyword) return;
    try {
      await navigator.clipboard.writeText(keyword);
      setCopyStatus('搜索词已复制');
    } catch {
      setCopyStatus('浏览器不允许自动复制，请长按上方搜索词复制');
    }
  };

  return (
    <div className="page-stack">
      <section className="recipe-panel" aria-labelledby="recipe-title">
        <p className="eyebrow">从库存出发</p>
        <h2 id="recipe-title">今天想用哪些食材？</h2>
        <p className="recipe-panel__intro">建议先选 2–4 种主要食材，搜索结果会更聚焦。</p>

        <div className="ingredient-grid">
          {items.map((item) => (
            <label aria-label={`选择${item.name}`} className="ingredient-choice" key={item.id}>
              <input
                aria-label={`选择${item.name}，库存 ${item.quantity} ${item.unit}`}
                checked={selectedIds.has(item.id)}
                type="checkbox"
                onChange={() => toggleItem(item.id)}
              />
              <span>
                <strong>{item.name}</strong>
                <small>
                  {item.quantity} {item.unit}
                </small>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="search-preview" aria-labelledby="search-preview-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">实际搜索词</p>
            <h2 id="search-preview-title">{keyword ?? '请先选择食材'}</h2>
          </div>
          {keyword && (
            <button className="button button--small button--secondary" type="button" onClick={copyKeyword}>
              复制
            </button>
          )}
        </div>
        {copyStatus && (
          <p className="copy-status" role="status">
            {copyStatus}
          </p>
        )}

        <div className="platform-actions">
          {keyword ? (
            <>
              <a
                aria-label="去小红书搜"
                className="platform-link platform-link--xhs"
                href={buildRecipeSearchUrl('xiaohongshu', ingredients)}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span>小红书</span>
                <strong>去小红书搜</strong>
              </a>
              <a
                aria-label="去 B 站搜"
                className="platform-link platform-link--bili"
                href={buildRecipeSearchUrl('bilibili', ingredients)}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span>B 站</span>
                <strong>去 B 站搜</strong>
              </a>
            </>
          ) : (
            <>
              <button
                aria-label="去小红书搜"
                className="platform-link platform-link--xhs"
                disabled
                type="button"
              >
                <span>小红书</span>
                <strong>去小红书搜</strong>
              </button>
              <button
                aria-label="去 B 站搜"
                className="platform-link platform-link--bili"
                disabled
                type="button"
              >
                <span>B 站</span>
                <strong>去 B 站搜</strong>
              </button>
            </>
          )}
        </div>
        <p className="safety-note">
          将打开平台官方搜索页；本应用不抓取、保存或重排第三方内容。
        </p>
      </section>
    </div>
  );
}
