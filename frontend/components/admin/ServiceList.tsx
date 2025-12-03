import { optionService, Service } from "@/types/models";

export function ServiceList({ services, selectedServices, onToggleService, onToggleOption }:
    { services: Service[]; selectedServices: Service[]; onToggleService: (s: Service) => void; onToggleOption: (serviceId?: string, opt?: optionService) => void }) {

    return (
        <div>
            <p className="font-medium text-slate-700 mb-3 text-sm md:text-xl">Services</p>
            {services.map(service => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                return (
                    <div key={service.id} className="mb-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={isSelected} onChange={() => onToggleService(service)} className="h-5 w-5 shrink-0" />
                            <span className="text-slate-500 text-sm md:text-xl leading-snug">{service.name} ({service.duration} min / ฿{service.price})</span>
                        </label>

                        {isSelected && service.options && (
                            <div className="ml-7 mt-2 flex flex-col gap-1">
                                {service.options.map(opt => {
                                    const hasOpt = selectedServices.find(s => s.id === service.id)?.options?.some(o => o.id === opt.id);
                                    return (
                                        <label key={opt.id} className="flex items-center gap-2 cursor-pointer text-sm md:text-lg">
                                            <input type="checkbox" checked={!!hasOpt} onChange={() => onToggleOption(String(service.id), opt)} className="h-4 w-4" />
                                            {opt.name} (+฿{opt.price})
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}