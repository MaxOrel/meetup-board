import styles from './CatalogSkeleton.module.css'

export interface CatalogSkeletonProps {
  count?: number
}

export function CatalogSkeleton({ count = 3 }: CatalogSkeletonProps) {
  return (
    <section className={styles.catalog} aria-busy="true" aria-label="Загружаем события">
      {Array.from({ length: count }, (_, i) => (
        <div className={styles.card} key={i} aria-hidden="true">
          <div className={styles.stub}>
            <div className={`${styles.line} ${styles.date}`} />
          </div>
          <div className={styles.body}>
            <div className={`${styles.line} ${styles.cover}`} />
            <div className={`${styles.line} ${styles.short}`} />
            <div className={`${styles.line} ${styles.long}`} />
            <div className={`${styles.line} ${styles.medium}`} />
          </div>
        </div>
      ))}
    </section>
  )
}
