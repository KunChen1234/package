declare namespace io {
	export interface UserIdTag {
		ID: string | undefined | null;
		section: string | undefined | null;
		firstName: string | undefined | null;
		lastName: string | undefined | null;
		departmentName: string | undefined | null;
		photo: string | undefined | null;
		job: string | undefined | null;
	}

	export interface DeviceInfo {
		MAC: string | undefined | null;
		SN: string | undefined | null;
		Bssid: string | undefined | null;
		ChargingStatus: boolean | undefined | null;
		updateTime: string | undefined;
	}

	export interface LoginInfo {
		User: resultOfUser | null;
		userID: String;
		LampMAC: String;
		LampSN: String;
	}
}