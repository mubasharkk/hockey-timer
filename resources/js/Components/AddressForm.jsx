const TextField = ({ label, value, onChange, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

export default function AddressForm({ address, onChange, errors = {}, title = "Address (optional)" }) {
    return (
        <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField
                    label="Street"
                    value={address.street || ''}
                    onChange={(val) => onChange({ ...address, street: val })}
                    error={errors['street']}
                />
                <TextField
                    label="City"
                    value={address.city || ''}
                    onChange={(val) => onChange({ ...address, city: val })}
                    error={errors['city']}
                />
                <TextField
                    label="Postal Code"
                    value={address.post_code || ''}
                    onChange={(val) => onChange({ ...address, post_code: val })}
                    error={errors['post_code']}
                />
                <TextField
                    label="State"
                    value={address.state || ''}
                    onChange={(val) => onChange({ ...address, state: val })}
                    error={errors['state']}
                />

                <TextField
                    label="Country"
                    value={address.country || ''}
                    onChange={(val) => onChange({ ...address, country: val })}
                    error={errors['country']}
                />
            </div>
        </div>
    );
}
