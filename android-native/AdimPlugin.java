package com.kalorivision.app;

import android.Manifest;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

// Telefonun donanım adım sayacı (TYPE_STEP_COUNTER): uygulama kapalıyken de sayar; açılınca toplamı okuruz.
@CapacitorPlugin(name = "Adim", permissions = { @Permission(strings = { Manifest.permission.ACTIVITY_RECOGNITION }, alias = "adim") })
public class AdimPlugin extends Plugin {
    @PluginMethod
    public void oku(PluginCall call) {
        if (getPermissionState("adim") != PermissionState.GRANTED) {
            requestPermissionForAlias("adim", call, "izinSonra");
            return;
        }
        oku2(call);
    }

    @PermissionCallback
    private void izinSonra(PluginCall call) {
        if (getPermissionState("adim") == PermissionState.GRANTED) oku2(call);
        else call.reject("izin");
    }

    private void oku2(final PluginCall call) {
        final SensorManager sm = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        Sensor s = sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        if (s == null) { call.reject("sensor yok"); return; }
        final boolean[] bitti = { false };
        final SensorEventListener l = new SensorEventListener() {
            @Override public void onSensorChanged(SensorEvent e) {
                if (bitti[0]) return;
                bitti[0] = true;
                sm.unregisterListener(this);
                JSObject o = new JSObject();
                o.put("toplam", (double) e.values[0]);
                call.resolve(o);
            }
            @Override public void onAccuracyChanged(Sensor x, int a) {}
        };
        sm.registerListener(l, s, SensorManager.SENSOR_DELAY_NORMAL);
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (bitti[0]) return;
            bitti[0] = true;
            sm.unregisterListener(l);
            call.reject("yanit yok");
        }, 4000);
    }
}
