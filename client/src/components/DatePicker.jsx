import React from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/dark.css";
import { FaCalendarAlt } from "react-icons/fa";
import "./DatePicker.css";

const DatePicker = ({ label, selected, onChange, error }) => {
    return (
        <div className="datepicker-container">
            {label && <label className="block mb-1 text-sm text-gray-400">{label}</label>}
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10">
                    <FaCalendarAlt size={14} />
                </div>
                <Flatpickr
                    value={selected instanceof Date ? selected : new Date(selected || Date.now())}
                    onChange={([date]) => onChange(date)}
                    className={`w-full p-3 pl-10 rounded-xl bg-white/5 border ${error ? "border-red-500" : "border-white/10 hover:border-purple-500"
                        } focus:outline-none transition-colors text-white cursor-pointer`}
                    options={{
                        dateFormat: "F j, Y",
                        disableMobile: true,
                        allowInput: true
                    }}
                    placeholder="Select Date"
                />
            </div>
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default DatePicker;
