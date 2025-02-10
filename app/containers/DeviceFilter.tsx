import { useMyDevices } from '../providers/MyDevices';
import { useAuth } from "../providers/AuthProvider";

import React, {
    useEffect,
    useState,
    useRef
} from 'react';

import {
    TextInputGroup,
    TextInputGroupMain,
    TextInputGroupUtilities,
    Select,
    SelectGroup,
    SelectOption,
    SelectOptionProps,
    SelectList,
    MenuToggle,
    MenuToggleElement,
    Icon,
    Divider,
    Button,
    Avatar
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';
import MicrochipIcon from '@patternfly/react-icons/dist/esm/icons/microchip-icon';

type DeviceSelectOption = SelectOptionProps & {
    hasCheckbox?: boolean;
    isAriaDisabled?: boolean;
    uuid?: string;
    organisationId?: string | null;
    imageUrl?: string | null;
    name?: string | null;
};

export default function DeviceFilter() {
    const { isAuthenticated, user } = useAuth();

    // Instantiate and initialise states
    const initialSelectOptions: DeviceSelectOption[] = [
        {
            value: 'No devices found',
            children: 'No devices found',
            hasCheckbox: false,
            isAriaDisabled: true
        }

    ];
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState<string>('');
    const [selected, setSelected] = useState<string[]>([]);
    const [selectOptions, setSelectOptions] = useState<DeviceSelectOption[]>(initialSelectOptions);
    const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const [placeholder, setPlaceholder] = useState('Filter displayed devices');
    const textInputRef = useRef<HTMLInputElement>(null)

    // Initialise default variables
    const NO_RESULTS = 'No devices found';

    // Device details
    const { devices, isLoading, error, fetchDevices } = useMyDevices();

    useEffect(() => {
        if (isLoading) {
            setSelectOptions([{
                value: 'loading',
                children: 'Loading devices...',
                hasCheckbox: false,
                isAriaDisabled: true
            }]);
            return;
        }

        if (error) {
            setSelectOptions([{
                value: 'error',
                children: 'Error loading devices',
                hasCheckbox: false,
                isAriaDisabled: true
            }]);
            return;
        }

        if (devices.length === 0) {
            setSelectOptions([{
                value: NO_RESULTS,
                children: 'No devices found',
                hasCheckbox: false,
                isAriaDisabled: true
            }]);
            return;
        }

        let newSelectOptions: DeviceSelectOption[] = devices.length ?
            devices.map(device => ({
                value: device.uuid,
                children: device.name || device.uuid,
                uuid: device.uuid,
                organisationId: device.keycloak_org_id || null,
                imageUrl: device.image_path || null,
                friendlyName: device.name || null,
                hasCheckbox: true
            })) : initialSelectOptions;

        // Filter menu items based on the text input value when one exists
        if (inputValue) {
            newSelectOptions = newSelectOptions.filter((menuItem) =>
                String(menuItem.children).toLowerCase().includes(inputValue.toLowerCase())
            );

            // When no options are found after filtering, display 'No results found'
            if (!newSelectOptions.length) {
                newSelectOptions = [
                    {
                        isAriaDisabled: true,
                        children: `No devices found named "${inputValue}"`,
                        value: NO_RESULTS,
                        hasCheckbox: false
                    }
                ];
            }

            // Open the menu when the input value changes and the new value is not empty
            if (!isOpen) {
                setIsOpen(true);
            }
        }

        setSelectOptions(newSelectOptions);
    }, [inputValue, devices, isLoading]);

    const createItemId = (value: any) => `select-multi-typeahead-${value.replace(' ', '-')}`;

    const setActiveAndFocusedItem = (itemIndex: number) => {
        setFocusedItemIndex(itemIndex);
        const focusedItem = selectOptions[itemIndex];
        setActiveItemId(createItemId(focusedItem.value));
    };

    const resetActiveAndFocusedItem = () => {
        setFocusedItemIndex(null);
        setActiveItemId(null);
    };

    const closeMenu = () => {
        setIsOpen(false);
        resetActiveAndFocusedItem();
    };

    const onInputClick = () => {
        if (!isOpen) {
            setIsOpen(true);
        } else if (!inputValue) {
            closeMenu();
        }
    };

    const handleMenuArrowKeys = (key: string) => {
        let indexToFocus = 0;

        if (!isOpen) {
            setIsOpen(true);
        }

        if (selectOptions.every((option) => option.isDisabled)) {
            return;
        }

        if (key === 'ArrowUp') {
            // When no index is set or at the first index, focus to the last, otherwise decrement focus index
            if (focusedItemIndex === null || focusedItemIndex === 0) {
                indexToFocus = selectOptions.length - 1;
            } else {
                indexToFocus = focusedItemIndex - 1;
            }

            // Skip disabled options
            while (selectOptions[indexToFocus].isDisabled) {
                indexToFocus--;
                if (indexToFocus === -1) {
                    indexToFocus = selectOptions.length - 1;
                }
            }
        }

        if (key === 'ArrowDown') {
            // When no index is set or at the last index, focus to the first, otherwise increment focus index
            if (focusedItemIndex === null || focusedItemIndex === selectOptions.length - 1) {
                indexToFocus = 0;
            } else {
                indexToFocus = focusedItemIndex + 1;
            }

            // Skip disabled options
            while (selectOptions[indexToFocus].isDisabled) {
                indexToFocus++;
                if (indexToFocus === selectOptions.length) {
                    indexToFocus = 0;
                }
            }
        }

        setActiveAndFocusedItem(indexToFocus);
    };

    const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const focusedItem = focusedItemIndex !== null ? selectOptions[focusedItemIndex] : null;

        switch (event.key) {
            case 'Enter':
                if (isOpen && focusedItem && focusedItem.value !== NO_RESULTS && !focusedItem.isAriaDisabled) {
                    onSelect(focusedItem.value);
                }

                if (!isOpen) {
                    setIsOpen(true);
                }

                break;
            case 'ArrowUp':
            case 'ArrowDown':
                event.preventDefault();
                handleMenuArrowKeys(event.key);
                break;
        }
    };

    const onToggleClick = () => {
        setIsOpen(!isOpen);
        textInputRef?.current?.focus();
    };

    const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
        setInputValue(value);
        resetActiveAndFocusedItem();
    };

    const onSelect = (value: string) => {
        if (value && value !== NO_RESULTS) {
            // eslint-disable-next-line no-console
            console.log('selected', value);

            setSelected(
                selected.includes(value) ? selected.filter((selection) => selection !== value) : [...selected, value]
            );
        }

        textInputRef.current?.focus();
    };

    const onClearButtonClick = () => {
        setSelected([]);
        setInputValue('');
        resetActiveAndFocusedItem();
        textInputRef?.current?.focus();
    };

    const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
            variant="typeahead"
            aria-label="Device filter"
            onClick={onToggleClick}
            innerRef={toggleRef}
            isExpanded={isOpen}
            isFullWidth
        >
            <TextInputGroup isPlain>
                <TextInputGroupMain
                    value={inputValue}
                    onClick={onInputClick}
                    onChange={onTextInputChange}
                    onKeyDown={onInputKeyDown}
                    id="device-filter-input"
                    autoComplete="off"
                    innerRef={textInputRef}
                    placeholder={placeholder}
                    {...(activeItemId && { 'aria-activedescendant': activeItemId })}
                    role="combobox"
                    isExpanded={isOpen}
                    aria-controls="device-filter-listbox"
                />
                <TextInputGroupUtilities {...(selected.length === 0 ? { style: { display: 'none' } } : {})}>
                    <Button
                        variant="plain"
                        onClick={onClearButtonClick}
                        aria-label="Clear input value"
                        icon={<TimesIcon aria-hidden />}
                    />
                </TextInputGroupUtilities>
            </TextInputGroup>
        </MenuToggle>
    );

    return (
        <>
            <Select
                role="menu"
                id="device-filter-select"
                isOpen={isOpen}
                selected={selected}
                onSelect={(_event, selection) => onSelect(selection as string)}
                onOpenChange={(isOpen) => {
                    !isOpen && closeMenu();
                }}
                toggle={toggle}
                variant="typeahead"
            >
                <SelectGroup label="My Devices">
                    <SelectList isAriaMultiselectable id="select-my-device-filter-listbox">
                        {selectOptions
                            .filter(option => option.organisationId === null)
                            .map((option, index) => (
                                <SelectOption
                                    {...(!option.isDisabled && !option.isAriaDisabled && { hasCheckbox: true })}
                                    isSelected={selected.includes(option.value)}
                                    key={option.value || option.children}
                                    isFocused={focusedItemIndex === index}
                                    className={option.className}
                                    id={createItemId(option.value)}
                                    {...option}
                                    ref={null}
                                    icon={option.imageUrl ? <Avatar
                                        src={option.imageUrl}
                                        alt={`${option.uuid}'s avatar`}
                                        className={"pf-v6-c-avatar pf-m-sm"}
                                        style={{verticalAlign: "bottom"}}
                                        isBordered
                                    /> : <Icon>
                                            <MicrochipIcon />
                                        </Icon>
                                    }
                                />
                            ))}
                    </SelectList>
                </SelectGroup>
                {user?.organisations && user.organisations.map((organisation) => (
                    <React.Fragment key={organisation}>
                        <Divider />
                        <SelectGroup label={`${organisation}'s Devices`}>
                            <SelectList isAriaMultiselectable id={`select-org-${organisation}-devices-listbox`}>
                                {selectOptions
                                    .filter(option => option.organisationId === organisation)
                                    .map((option, index) => (
                                        <SelectOption
                                            {...(!option.isDisabled && !option.isAriaDisabled && { hasCheckbox: true })}
                                            isSelected={selected.includes(option.value)}
                                            key={option.value || option.children}
                                            isFocused={focusedItemIndex === index}
                                            className={option.className}
                                            id={createItemId(option.value)}
                                            {...option}
                                            ref={null}
                                            icon={option.imageUrl ? <Avatar
                                                src={option.imageUrl}
                                                alt={`${option.uuid}'s avatar`}
                                                className={"pf-v6-c-avatar pf-m-sm"}
                                                style={{verticalAlign: "bottom"}}
                                                isBordered
                                                /> : <Icon>
                                                        <MicrochipIcon />
                                                    </Icon>
                                            }
                                        />
                                    ))}
                            </SelectList>
                        </SelectGroup>
                    </React.Fragment>
                ))}

            </Select>
        </>
    );
}