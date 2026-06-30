import { type ReactNode } from "react";
import styles from "./Table.module.css";

export interface Column<T> {
  header: string;
  render: (item: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  renderActions?: (item: T) => ReactNode;
}

export function Table<T>({ data, columns, renderActions }: TableProps<T>) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className={styles.th}>
                {column.header}
              </th>
            ))}
            {renderActions && <th className={`${styles.th} ${styles.actionsHeader}`}>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} className={styles.emptyRow}>
                Nenhum registro encontrado.
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr key={rowIndex} className={styles.tr}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={styles.td}>
                    {column.render(item)}
                  </td>
                ))}
                {renderActions && (
                  <td className={styles.td}>
                    <div className={styles.actionsContainer}>
                      {renderActions(item)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}