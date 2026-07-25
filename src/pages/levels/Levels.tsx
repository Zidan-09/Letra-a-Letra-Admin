import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { LevelsRequests, type Level } from "../../lib/Levels";
import styles from "./Levels.module.css";

export function LevelsPage() {
    const { notify } = useNotification();

    const [levels, setLevels] = useState<Level[]>([]);

    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    const fetchLevels = async () => {    
        try {
          const data = await LevelsRequests.getLevels(page, 5);
    
          setLevels(data.content);
          setTotalPages(data.totalPages);

        } catch (e) {
          console.error(e);
          notify.error("Erro ao carregar a lista de níveis.");
        }
    };

    useEffect(() => {
        fetchLevels();
    }, [page]);

    console.log(levels);

    return (
        <div className={styles.container}>

        </div>
    )
}