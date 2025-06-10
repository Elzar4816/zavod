// src/theme/uiStyles.js
export const inputStyle = {
    input: { color: '#fff' },
    label: { color: '#fff' },
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#555' },
        '&:hover fieldset': { borderColor: '#fff' },
        '&.Mui-focused fieldset': { borderColor: '#646cff' },
        backgroundColor: '#2a2a2a',
    },
};

export const selectWhiteStyle = {
    '& label': { color: '#fff' },
    '& label.Mui-focused': { color: '#646cff' },
    '& .MuiOutlinedInput-root': {
        backgroundColor: 'none',
        '& fieldset': { borderColor: '#ccc' },
        '&:hover fieldset': { borderColor: '#888' },
        '&.Mui-focused fieldset': { borderColor: '#646cff' },
        '& .MuiSelect-select': { color: '#fff' },
        '& .MuiSvgIcon-root': { color: '#fff' },
    },
};

export const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: '#1e1e1e',
    color: '#fff',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    minWidth: 300,
};

export const tableHeadCellStyle = {
    color: '#fff',
    backgroundColor: '#6F1A07',
    fontSize: '20px',
};

export const tableBodyCellStyle = {
    color: '#3d3d3d',
    fontSize: '20px',
    backgroundColor: '#B3B6B7',
};

const glowColorPrimary = 'rgba(182,186,241,0.24)';
const glowColorSecondary = '#646cff1a';
const glassBorderColor = 'rgba(87,71,71,0.59)';
export const glassTableStyle = {
    backgroundColor: 'rgba(0,0,0,0.05)',
    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
    boxShadow: `0 0 20px ${glowColorPrimary}, 0 0 60px ${glowColorSecondary}`,
    borderRadius: '12px', border: `1px solid ${glassBorderColor}`,
    overflow: 'hidden',
};
export const selectWhiteStyleForDropper = {
    "& label": { color: "#000000" },
    "& label.Mui-focused": { color: "#646cff" },
    "& .MuiOutlinedInput-root": {
        backgroundColor: "none",
        "& fieldset": { borderColor: "#ccc" },
        "&:hover fieldset": { borderColor: "#888" },
        "&.Mui-focused fieldset": { borderColor: "#646cff" },
        "& .MuiSelect-select": { color: "#000000" },
        "& .MuiSvgIcon-root": { color: "#000000" },
    },
};