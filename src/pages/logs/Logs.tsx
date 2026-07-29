import { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    Download,
    FileText,
    Folder,
    Gamepad2,
    RefreshCcw,
    Shield
} from "lucide-react";

import styles from "./Logs.module.css";
import { LogRequests } from "./lib/Logs";

type Directory =
    | { type: "ROOT" }
    | { type: "ADMIN" }
    | { type: "ADMIN_FILE"; file: string }
    | { type: "GAME" }
    | { type: "GAME_DATE"; date: string }
    | { type: "GAME_MATCH"; date: string; gameId: string }
    | { type: "GAME_FILE"; date: string; gameId: string; file: string }
    | { type: "UNTRACKED" }
    | { type: "UNTRACKED_FILE"; file: string };

type ExplorerItem = {
    name: string;
    type: "folder" | "file";
};

export function LogsPage() {

    const [directory, setDirectory] = useState<Directory>({
        type: "ROOT"
    });

    const [items, setItems] = useState<ExplorerItem[]>([]);
    const [fileContent, setFileContent] = useState("");

    const [loading, setLoading] = useState(false);
    const [loadingFile, setLoadingFile] = useState(false);
    const [rotating, setRotating] = useState(false);

    function formatDate(dateString: string) {
        const date = new Date(dateString);

        return `${date.getDate()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`;
    }

    useEffect(() => {
        loadDirectory(directory);
    }, [directory]);

    const breadcrumb = useMemo(() => {

        switch (directory.type) {

            case "ROOT":
                return "Logs";

            case "ADMIN":
                return "Logs / Admin";

            case "ADMIN_FILE":
                return `Logs / Admin / ${directory.file}`;

            case "GAME":
                return "Logs / Game";

            case "GAME_DATE":
                return `Logs / Game / ${formatDate(directory.date)}`;

            case "GAME_MATCH":
                return `Logs / Game / ${formatDate(directory.date)} / ${directory.gameId}`;

            case "GAME_FILE":
                return `Logs / Game / ${formatDate(directory.date)} / ${directory.gameId} / ${directory.file}`;

            case "UNTRACKED":
                return "Logs / Game / Untracked";

            case "UNTRACKED_FILE":
                return `Logs / Game / Untracked / ${directory.file}`;

        }

    }, [directory]);

        async function loadDirectory(current: Directory) {

        setLoading(true);

        try {

            setItems([]);
            setFileContent("");

            switch (current.type) {

                case "ROOT":

                    setItems([
                        {
                            name: "Game",
                            type: "folder"
                        },
                        {
                            name: "Admin",
                            type: "folder"
                        }
                    ]);

                    break;

                case "ADMIN": {

                    const logs = await LogRequests.getAdminLogs();

                    setItems(
                        logs.map(log => ({
                            name: log,
                            type: "file"
                        }))
                    );

                    break;
                }

                case "GAME": {

                    const dates = await LogRequests.getGameLogDates();

                    setItems([
                        {
                            name: "Untracked",
                            type: "folder"
                        },
                        ...dates.map(date => ({
                            name: date,
                            type: "folder" as const
                        }))
                    ]);

                    break;
                }

                case "GAME_DATE": {

                    const games =
                        await LogRequests.getGames(current.date);

                    setItems(
                        games.map(game => ({
                            name: game,
                            type: "folder"
                        }))
                    );

                    break;
                }

                case "GAME_MATCH": {

                    const files =
                        await LogRequests.getGameFiles(
                            current.date,
                            current.gameId
                        );

                    setItems(
                        files.map(file => ({
                            name: file,
                            type: "file"
                        }))
                    );

                    break;
                }

                case "UNTRACKED": {

                    const files =
                        await LogRequests.getUntrackedLogs();

                    setItems(
                        files.map(file => ({
                            name: file,
                            type: "file"
                        }))
                    );

                    break;
                }

                case "ADMIN_FILE": {

                    setLoadingFile(true);

                    try {

                        const content =
                            await LogRequests.getAdminLog(current.file);

                        setFileContent(content);

                    } finally {
                        setLoadingFile(false);
                    }

                    break;
                }

                case "UNTRACKED_FILE": {

                    setLoadingFile(true);

                    try {

                        const content =
                            await LogRequests.getUntrackedLog(current.file);

                        setFileContent(content);

                    } finally {
                        setLoadingFile(false);
                    }

                    break;
                }

                case "GAME_FILE": {

                    setLoadingFile(true);

                    try {

                        const content =
                            await LogRequests.getGameLog(
                                current.date,
                                current.gameId,
                                current.file
                            );

                        setFileContent(content);

                    } finally {
                        setLoadingFile(false);
                    }

                    break;
                }

            }

        } finally {
            setLoading(false);
        }

    }

    function openItem(item: ExplorerItem) {

        switch (directory.type) {

            case "ROOT":

                setDirectory({
                    type: item.name === "Admin"
                        ? "ADMIN"
                        : "GAME"
                });

                return;

            case "ADMIN":

                setDirectory({
                    type: "ADMIN_FILE",
                    file: item.name
                });

                return;

            case "GAME":

                if (item.name === "Untracked") {

                    setDirectory({
                        type: "UNTRACKED"
                    });

                    return;

                }

                setDirectory({
                    type: "GAME_DATE",
                    date: item.name
                });

                return;

            case "GAME_DATE":

                setDirectory({
                    type: "GAME_MATCH",
                    date: directory.date,
                    gameId: item.name
                });

                return;

            case "GAME_MATCH":

                setDirectory({
                    type: "GAME_FILE",
                    date: directory.date,
                    gameId: directory.gameId,
                    file: item.name
                });

                return;

            case "UNTRACKED":

                setDirectory({
                    type: "UNTRACKED_FILE",
                    file: item.name
                });

                return;

        }

    }

    function goBack() {

        switch (directory.type) {

            case "ADMIN":
            case "GAME":

                setDirectory({
                    type: "ROOT"
                });

                break;

            case "ADMIN_FILE":

                setDirectory({
                    type: "ADMIN"
                });

                break;

            case "GAME_DATE":

                setDirectory({
                    type: "GAME"
                });

                break;

            case "GAME_MATCH":

                setDirectory({
                    type: "GAME_DATE",
                    date: directory.date
                });

                break;

            case "GAME_FILE":

                setDirectory({
                    type: "GAME_MATCH",
                    date: directory.date,
                    gameId: directory.gameId
                });

                break;

            case "UNTRACKED":

                setDirectory({
                    type: "GAME"
                });

                break;

            case "UNTRACKED_FILE":

                setDirectory({
                    type: "UNTRACKED"
                });

                break;

        }

    }

    async function refresh() {

        setRotating(true);

        await loadDirectory(directory);

        setTimeout(() => setRotating(false), 500);

    }

    function downloadCurrentFile() {

        if (!fileContent)
            return;

        let filename = "log.txt";

        switch (directory.type) {

            case "ADMIN_FILE":
            case "UNTRACKED_FILE":
            case "GAME_FILE":
                filename = directory.file;
                break;

        }

        const blob = new Blob(
            [fileContent],
            { type: "text/plain" }
        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        a.download = filename;

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);

        URL.revokeObjectURL(url);

    }

    const isViewingFile =
        directory.type === "ADMIN_FILE" ||
        directory.type === "GAME_FILE" ||
        directory.type === "UNTRACKED_FILE";

    const isRoot = directory.type === "ROOT";

    return (
        <div className={styles.container}>

            <div className={styles.header}>

                <div className={styles.titleGroup}>
                    <h1>Logs</h1>
                    <p>Navegue pelos logs do sistema.</p>
                </div>

                <div className={styles.actions}>

                    <button
                        className={styles.refresh}
                        onClick={refresh}
                    >
                        <RefreshCcw
                            size={18}
                            className={rotating ? styles.rotating : ""}
                        />
                    </button>

                </div>

            </div>

            <div className={styles.content}>

                <div className={styles.explorer}>
                    <div className={styles.navigation}>

                        <button
                            className={isRoot ? styles.disabledButton : styles.backButton}
                            disabled={isRoot}
                            onClick={goBack}
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <span className={styles.breadcrumb}>
                            {breadcrumb}
                        </span>

                    </div>

                    {!isViewingFile && (
                        <div>
                        {loading ? (

                            <div className={styles.loading}>
                                Carregando...
                            </div>

                        ) : (

                            <div className={styles.grid}>

                                {items.map(item => (

                                    <button
                                        key={item.name}
                                        className={styles.item}
                                        onClick={() => openItem(item)}
                                    >

                                        <div className={styles.itemIcon}>

                                            {item.type === "folder" ? (
                                                isRoot ? (
                                                    item.name === "Game" ? (
                                                        <Gamepad2 size={34} />
                                                    ) : (
                                                        <Shield size={34} />
                                                    )
                                                ) : (
                                                    <Folder size={34} />
                                                )
                                            ) : (
                                                <FileText size={34} />
                                            )}

                                        </div>

                                        <div className={styles.itemInfo}>

                                            <span
                                                className={styles.itemName}
                                                title={item.name}
                                            >
                                                {item.name}
                                            </span>

                                            <span className={styles.itemType}>
                                                {item.type === "folder"
                                                    ? "Pasta"
                                                    : "Arquivo"}
                                            </span>

                                        </div>

                                    </button>

                                ))}

                            </div>

                        )}
                        </div>
                    )}
                </div>

                

                {(directory.type === "ADMIN_FILE" ||
                    directory.type === "GAME_FILE" ||
                    directory.type === "UNTRACKED_FILE") && (

                    <div className={styles.viewer}>

                        <div className={styles.viewerHeader}>

                            <span className={styles.viewerTitle}>
                                {directory.file}
                            </span>

                            <button
                                className={styles.downloadButton}
                                onClick={downloadCurrentFile}
                            >
                                <Download size={18} />
                                Baixar
                            </button>

                        </div>

                        <div className={styles.viewerContent}>

                            {loadingFile ? (

                                <div className={styles.loading}>
                                    Carregando arquivo...
                                </div>

                            ) : (

                                <pre className={styles.logContent}>
                                    {fileContent}
                                </pre>

                            )}

                        </div>

                    </div>

                )}

            </div>

        </div>
    );

}