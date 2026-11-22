package com.kalorivision.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdimPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
