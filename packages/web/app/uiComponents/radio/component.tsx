import { RenderDetailLevels } from "@/app/types";
import styles from "./radio.module.css";

interface RadioProps {
    id: string;
    name: string;
    label: string;
    value: string;
    checked: boolean;
    onChange: (value: RenderDetailLevels) => void;
}

export default function Radio({ id, name, label, value, checked, onChange }: RadioProps) {
    const handleChange = () => onChange(value as RenderDetailLevels);
    return (
        <label className={styles.radioLabel}>
            <input type="radio" className={styles.radioInput} id={id} name={name} value={value} checked={checked} onChange={handleChange} />
            {label}
        </label>
    );
}