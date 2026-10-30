export function createRangeControl(config, onInput) {
    const wrapper = document.createElement('div');
    wrapper.className = 'deck-range-control';

    const label = document.createElement('label');
    label.textContent = config.key;
    label.className = 'deck-range-label';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = config.min;
    slider.max = config.max;
    slider.step = config.step;
    slider.value = config.value;
    slider.className = 'deck-range-input';
    slider.addEventListener('input', (evt) => {
        onInput(evt.target.value, config.paramIndex);
    });

    wrapper.append(label, slider);
    return wrapper;
}

export function createToggleButton({ label, initialValue = false, inport = '', role = '', onToggle, className = 'button' }) {
    const button = document.createElement('button');
    button.className = `${className} deck-toggle`;
    button.textContent = label;
    button.dataset.value = String(initialValue);
    button.dataset.inport = inport;

    if (role) {
        button.dataset.role = role;
    }

    button.classList.add(initialValue ? 'on' : 'off');

    button.addEventListener('click', () => {
        const isOn = button.dataset.value === 'true';
        const next = !isOn;

        button.dataset.value = String(next);
        button.classList.remove(isOn ? 'on' : 'off');
        button.classList.add(next ? 'on' : 'off');

        if (onToggle) {
            onToggle({ button, isOn, next, inport });
        }
    });

    return button;
}

export function createDropdownControl({ buttonLabel = '-select-', items = [], onSelect, buttonClass = 'button', menuClass = 'deck-dropdown-menu' }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'deck-dropdown';

    const button = document.createElement('button');
    button.className = `${buttonClass} deck-dropdown-button`;
    button.textContent = buttonLabel;

    const menu = document.createElement('div');
    menu.className = `deck-dropdown-menu ${menuClass}`;

    items.forEach((item) => {
        const itemButton = document.createElement('button');
        itemButton.className = 'deck-dropdown-item';
        itemButton.textContent = item.label;
        itemButton.addEventListener('click', () => {
            button.textContent = item.label;
            menu.classList.remove('show');
            if (onSelect) {
                onSelect(item);
            }
        });
        menu.appendChild(itemButton);
    });

    button.addEventListener('click', () => {
        menu.classList.toggle('show');
    });

    wrapper.append(button, menu);
    return { element: wrapper, button, menu };
}

export function createFilterPanel({ panelIndex, filterTypes, sliderConfig, onFilterTypeChange, onFilterSettingChange }) {
    const panel = document.createElement('div');
    panel.className = 'filter-controls';

    const typeContainer = document.createElement('div');
    typeContainer.className = 'filter-type-select';

    const filterTypeDropdown = createDropdownControl({
        buttonLabel: '--select-filter-type--',
        items: filterTypes.map((type, typeIndex) => ({ label: type, value: typeIndex })),
        onSelect: (item) => {
            if (onFilterTypeChange) {
                onFilterTypeChange(panelIndex, item.value);
            }
        }
    });

    typeContainer.appendChild(filterTypeDropdown.element);
    panel.appendChild(typeContainer);

    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'filter-sliders';

    sliderConfig.forEach((config) => {
        const control = createRangeControl(config, (value, paramIndex) => {
            if (onFilterSettingChange) {
                onFilterSettingChange(panelIndex, paramIndex, value);
            }
        });
        sliderContainer.appendChild(control);
    });

    panel.appendChild(sliderContainer);

    return { element: panel, dropdown: filterTypeDropdown };
}
